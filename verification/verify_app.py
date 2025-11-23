from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Capture console logs
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Page Error: {err}"))

        try:
            print("Navigating to dashboard...")
            page.goto("http://localhost:3001")

            # Wait for dashboard to load
            page.wait_for_selector("text=BillScan", timeout=10000)
            print("Dashboard loaded.")

            # Take screenshot of dashboard
            page.screenshot(path="verification/dashboard.png")
            print("Dashboard screenshot saved.")

            print("Navigating to upload page...")
            page.goto("http://localhost:3001/upload")
            page.wait_for_selector("text=Take a Photo", timeout=10000)
            page.screenshot(path="verification/upload_page.png")
            print("Upload page screenshot saved.")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_app()
