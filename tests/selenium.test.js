import { Builder, By, until } from 'selenium-webdriver';

(async function runUiTests() {
  console.log("Initializing WebDriver...");
  // Note: Ensure you have ChromeDriver installed or let Selenium Manager handle it automatically (v4.6+)
  let driver = await new Builder().forBrowser('chrome').build();
  
  try {
    console.log("Navigating to local dev server (http://localhost:5173)...");
    await driver.get('http://localhost:5173');
    
    // 1. Verify App Title 
    let title = await driver.getTitle();
    console.log("Validating Page Title: ", title);
    if (!title.includes('Career Mentor')) {
       throw new Error("Title doesn't match expected 'Career Mentor App'");
    }

    // 2. Click on 'Career Exploration' in LeftPanel Sidebar
    console.log("Testing LeftPanel Navigation -> Career Exploration...");
    let explorationNav = await driver.wait(until.elementLocated(By.xpath("//li[contains(text(), 'Career Exploration')]")), 5000);
    await explorationNav.click();

    // 3. Verify 'Career Exploration AI' header appears signifying successful routing
    await driver.wait(until.elementLocated(By.xpath("//h1[contains(text(), 'Career Exploration AI')]")), 5000);
    console.log("Successfully routed to Career Exploration View.");
    
    // 4. Send a message in Chat Input
    console.log("Testing Chat Input component...");
    let inputField = await driver.wait(until.elementLocated(By.css('input[placeholder="Type your response..."]')), 5000);
    await inputField.sendKeys('I am interested in software engineering.');
    
    let sendButton = await driver.findElement(By.xpath("//button[text()='Send']"));
    await sendButton.click();
    console.log("Chat message submitted successfully.");

    // 5. Navigate to 'Interview Prep'
    console.log("Testing LeftPanel Navigation -> Interview Prep...");
    let interviewNav = await driver.wait(until.elementLocated(By.xpath("//li[contains(text(), 'Interview Prep')]")), 5000);
    await interviewNav.click();

    // 6. Navigate to subtab 'Salary Negotiation'
    console.log("Testing Sub-Navigation Tabs -> Salary Negotiation...");
    let salaryTab = await driver.wait(until.elementLocated(By.xpath("//button[text()='Salary Negotiation']")), 5000);
    await salaryTab.click();
    
    // Validate we are on Salary view showing "Market Insights" data CTA
    await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Market Insights')]")), 5000);
    console.log("Successfully routed to Salary Negotiation Tab view.");

    console.log("\n==================================");
    console.log("ALL SELENIUM E2E UI TESTS PASSED! ✅");
    console.log("==================================\n");

  } catch (err) {
    console.error("\n❌ TEST FAILED:", err.message);
  } finally {
    // Teardown the browser window
    await driver.quit();
  }
})();
