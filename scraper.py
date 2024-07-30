from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import json

def scrape_buddy_for_study():
    url = "https://www.buddy4study.com/scholarships"

    # Set up Chrome WebDriver
    chrome_options = webdriver.ChromeOptions()
    chrome_options.add_argument("--headless")  # Run in headless mode, no browser UI
    service = Service("c:\\Users\\HP\\Downloads\\chromedriver-win64\\chromedriver-win64\\chromedriver.exe")
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        # Load the webpage
        driver.get(url)

        # Identify element indicating scholarship content (replace with actual class)
        scholarship_content = "Listing_scholarshipName__VLFMj"

        # Wait for scholarships to load dynamically
        wait = WebDriverWait(driver, 10)
        try:
            elements = wait.until(EC.presence_of_all_elements_located((By.CLASS_NAME, scholarship_content)))
        except TimeoutException:
            print("Timed out waiting for scholarships to load")
            return []

        scholarships = []
        for item in elements:
            try:
                # Parent element for scholarship information
                scholarship_card = item.find_element(By.XPATH, "..")

                # Extract name
                name_tag = scholarship_card.find_element(By.CLASS_NAME, 'Listing_scholarshipName__VLFMj')
                name = name_tag.find_element(By.TAG_NAME, 'p').text.strip()

                # Extract deadline
                deadline_classes = ['Listing_noofDays__WtI47', 'Listing_maxnine__XpCvm', 'Listing_daystoGo__mTJ17']
                deadline = None
                for deadline_class in deadline_classes:
                    try:
                        deadline_tag = scholarship_card.find_element(By.CLASS_NAME, deadline_class)
                        if deadline_class == 'Listing_daystoGo__mTJ17':
                              deadline = deadline_tag.find_elements(By.TAG_NAME, 'p')[1].text.strip()
                        else:
                            deadline = deadline_tag.text.strip()
                        break
                    except:
                        continue
                if not deadline:
                    deadline = 'NA'

                # Extract description and eligibility
                description_tag = scholarship_card.find_elements(By.CLASS_NAME, 'Listing_rightAward__DxMQV')[0]
                description = description_tag.find_element(By.TAG_NAME, 'p').text.strip()

                eligibility_tag = scholarship_card.find_elements(By.CLASS_NAME, 'Listing_rightAward__DxMQV')[1]
                eligibility = eligibility_tag.find_element(By.TAG_NAME, 'p').text.strip()

                # Extract link
                link_tag = scholarship_card.find_element(By.TAG_NAME, 'a')
                link = link_tag.get_attribute('href')

                # Append to scholarships list
                scholarships.append({
                    'name': name,
                    'description': description,
                    'eligibility': eligibility,
                    'deadline': deadline,
                    'link': link
                })

            except Exception as e:
                print(f"Error extracting scholarship info for item: {e}")

        # Print the scraped scholarships
        print("Scraped scholarships:", scholarships)

        # Save to a JSON file
        with open('scholarships.json', 'w') as f:
            json.dump(scholarships, f, indent=4)

        return scholarships

    finally:
        driver.quit()  # Make sure to quit the driver to close the browser session

if __name__ == "__main__":
    scholarships = scrape_buddy_for_study()
