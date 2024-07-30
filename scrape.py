from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import json

def scrape_national_portal():
    url = "https://services.india.gov.in/service/listing?cat_id=66&ln=en"

    # Set up Chrome WebDriver
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")  # Run in headless mode, no browser UI
    service = Service("c:\\Users\\HP\\Downloads\\chromedriver-win64\\chromedriver-win64\\chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=chrome_options)

    scholarships = []

    try:
        # Load the initial webpage
        driver.get(url)

        # Class name for the scholarship content
        scholarship_content_class = "edu-lern-con"
        
        # Function to scrape the current page
        def scrape_current_page():
            print("Scraping current page...")
            elements = driver.find_elements(By.CLASS_NAME, scholarship_content_class)
            print(f"Found {len(elements)} scholarship elements on this page.")
            for item in elements:
                try:
                    # Extract name and link
                    name_tag = item.find_element(By.CLASS_NAME, 'ext-link')
                    name = name_tag.text.strip()
                    link = name_tag.get_attribute('href')
                    print(f"Name: {name}, Link: {link}")

                    # Extract description
                    description_tag = item.find_element(By.TAG_NAME, 'p')
                    description = description_tag.text.strip()
                    print(f"Description: {description}")

                    # Append to scholarships list
                    scholarships.append({
                        'name': name,
                        'description': description,
                        'link': link
                    })
                except Exception as e:
                    print(f"Error extracting scholarship info for item: {e}")

        # Scrape the first page
        scrape_current_page()

        # Page limit
        page_limit = 26
        current_page = 1

        # Loop through the rest of the pages up to the limit
        while current_page < page_limit:
            try:
                # Find the "Next" button using rel="next" and click it
                next_button = driver.find_element(By.CSS_SELECTOR, 'a[rel="next"]')
                next_button.click()

                # Wait for the new page to load
                wait = WebDriverWait(driver, 10)
                wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, scholarship_content_class)))

                # Scrape the current page
                scrape_current_page()

                # Increment the page counter
                current_page += 1
            except NoSuchElementException:
                # If there is no "Next" button, we have reached the last page
                print("No more pages to scrape.")
                break
            except TimeoutException:
                print("Timed out waiting for next page to load")
                break

        # Print the scraped scholarships
        print("Scraped scholarships:", scholarships)
        print("scholarships2 printed")

        # Save to a JSON file
        with open('scholarships2.json', 'w') as f:
            json.dump(scholarships, f, indent=4)

        return scholarships

    finally:
        driver.quit()  # Make sure to quit the driver to close the browser session

if __name__ == "__main__":
    scholarships = scrape_national_portal()
