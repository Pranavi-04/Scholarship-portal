This a Scholarship portal developed using Web scrapping with python, HTML, CSS, JavaScript, Node js, Express. selenuim library in python is used for web scrapping. Now we can browse both private and government scholarships from same website. Scholarships can be filtered by states, class or any keyword. data from original websites gets scrapped into this website every midnight to maintain accuracy and reliability. Any company can also add their own new scholarships which are not present in scrapped websites.

The data of scholarships is scrapped from "https://www.buddy4study.com/scholarships" and "https://services.india.gov.in/service/listing?cat_id=66&ln=en" for this project

Steps to run this project:
Download webdriver to use Selenuim (library for web scrapping). Chromedriver is used for this project
Run the following dependencies in command prompt:
npm install express mongoose body-parser cors,
npm install node-cron axios,
Then Run server.js in command prompt

Replace chromedriver location in python scripts with your own chromedriver location
Replace Mongodb connection link with your own connection link
