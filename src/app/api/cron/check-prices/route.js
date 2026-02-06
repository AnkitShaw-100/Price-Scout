import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { scrapeProduct } from "@/lib/firecrawl";
import { sendPriceDropAlert } from "@/lib/email";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // sanity check: ensure the service role key is available at runtime
    // if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    //   console.error("SUPABASE_SERVICE_ROLE_KEY is missing at runtime");
    //   return NextResponse.json(
    //     { error: "SUPABASE_SERVICE_ROLE_KEY is missing on the server" },
    //     { status: 500 }
    //   );
    // }

    // Use service role to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Diagnostic: log which Supabase URL we're calling (mask the key)
    console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log(
      "SUPABASE_SERVICE_ROLE_KEY present:",
      !!process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Fetch products and capture full response for diagnostics
    const productsRes = await supabase.from("products").select("*");

    if (productsRes.error) {
      console.error("Error fetching products:", productsRes.error);
      throw productsRes.error;
    }

    const products = productsRes.data || [];
    console.log("Found products response:", {
      length: products.length,
      status: productsRes.status,
      statusText: productsRes.statusText,
    });

    const results = {
      total: products.length,
      updated: 0,
      failed: 0,
      priceChanges: 0,
      alertsSent: 0,
    };

    for (const product of products) {
      try {
        const productData = await scrapeProduct(product.url);

        if (!productData.currentPrice) {
          results.failed++;
          continue;
        }

        const newPrice = parseFloat(productData.currentPrice);
        const oldPrice = parseFloat(product.current_price);

        const updateRes = await supabase
          .from("products")
          .update({
            current_price: newPrice,
            currency: productData.currencyCode || product.currency,
            name: productData.productName || product.name,
            image_url: productData.productImageUrl || product.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        if (updateRes.error) {
          console.error(`Failed to update product ${product.id}:`, updateRes.error);
          results.failed++;
          continue;
        }

        if (oldPrice !== newPrice) {
          const insertRes = await supabase.from("price_history").insert({
            product_id: product.id,
            price: newPrice,
            currency: productData.currencyCode || product.currency,
          });

          if (insertRes.error) {
            console.error(`Failed to insert price_history for ${product.id}:`, insertRes.error);
          }

          results.priceChanges++;

          if (newPrice < oldPrice) {
            const userRes = await supabase.auth.admin.getUserById(product.user_id);
            if (userRes.error) {
              console.error(`Failed to get user ${product.user_id}:`, userRes.error);
            } else {
              const user = userRes.data?.user;
              if (user?.email) {
                const emailResult = await sendPriceDropAlert(
                  user.email,
                  product,
                  oldPrice,
                  newPrice
                );

                if (emailResult.success) {
                  results.alertsSent++;
                } else if (emailResult.error) {
                  console.error(`Failed to send email to ${user.email}:`, emailResult.error);
                }
              }
            }
          }
        }

        results.updated++;
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: "Price check completed",
      results,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Price check endpoint is working. Use POST to trigger.",
  });
}

// curl.exe -X POST https://price-scout-blush.vercel.app/api/cron/check-prices -H "Authorization: Bearer 30588d32019b9ed131162c7d3c442703f1e7ddecb98e2b9c143fb90efd141f70"
