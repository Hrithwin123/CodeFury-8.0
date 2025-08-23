@echo off
echo Deploying Supabase Edge Functions...
echo.

echo Deploying process-bid function...
supabase functions deploy process-bid

echo.
echo Deploying finalize-auction function...
supabase functions deploy finalize-auction

echo.
echo Deploying razorpay-webhook function...
supabase functions deploy razorpay-webhook

echo.
echo All functions deployed successfully!
echo.
echo Next steps:
echo 1. Go to Supabase Dashboard ^> Settings ^> Edge Functions
echo 2. Set these environment variables:
echo    - SUPABASE_URL: Your project URL
echo    - SUPABASE_SERVICE_ROLE_KEY: Your service role key
echo    - RAZORPAY_WEBHOOK_SECRET: Your Razorpay webhook secret
echo.
pause
