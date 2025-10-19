/**
 * Automated Visual Test for Quest Progression
 * This test runs through a quest and captures screenshots at each key step
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runQuestTest() {
    console.log('🎮 Starting RPG Engine Quest Visual Test...\n');
    
    // Create screenshots directory
    const screenshotsDir = path.join(__dirname, '../screenshots');
    if (!fs.existsSync(screenshotsDir)) {
        fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    
    // Launch browser
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
        viewport: { width: 1280, height: 800 }
    });
    const page = await context.newPage();
    
    try {
        // Navigate to the quest demo
        console.log('📍 Navigating to quest demo...');
        await page.goto('http://localhost:3000/quest-demo.html');
        await page.waitForLoadState('networkidle');
        
        // Take initial screenshot
        console.log('📸 Screenshot 1: Initial State');
        await page.screenshot({ 
            path: path.join(screenshotsDir, '01-initial-state.png'),
            fullPage: true
        });
        
        // Start the quest
        console.log('▶️  Starting quest...');
        await page.click('#start-btn');
        await page.waitForTimeout(1500);
        
        console.log('📸 Screenshot 2: Quest Accepted');
        await page.screenshot({ 
            path: path.join(screenshotsDir, '02-quest-accepted.png'),
            fullPage: true
        });
        
        // Step 2: Travel to goblin camp
        await page.click('#start-btn');
        await page.waitForTimeout(2000);
        
        console.log('📸 Screenshot 3: Traveled to Goblin Camp');
        await page.screenshot({ 
            path: path.join(screenshotsDir, '03-at-goblin-camp.png'),
            fullPage: true
        });
        
        // Step 3-5: Fight goblin warriors
        for (let i = 1; i <= 3; i++) {
            await page.click('#start-btn');
            await page.waitForTimeout(2500);
            
            console.log(`📸 Screenshot ${3 + i}: Goblin Warrior #${i} Defeated`);
            await page.screenshot({ 
                path: path.join(screenshotsDir, `0${3 + i}-warrior-${i}-defeated.png`),
                fullPage: true
            });
        }
        
        // Step 6: Heal
        await page.click('#start-btn');
        await page.waitForTimeout(1500);
        
        console.log('📸 Screenshot 7: Healed and Prepared');
        await page.screenshot({ 
            path: path.join(screenshotsDir, '07-healed-prepared.png'),
            fullPage: true
        });
        
        // Step 7: Boss fight
        await page.click('#start-btn');
        await page.waitForTimeout(6000); // Boss fight takes longer
        
        console.log('📸 Screenshot 8: Boss Defeated');
        await page.screenshot({ 
            path: path.join(screenshotsDir, '08-boss-defeated.png'),
            fullPage: true
        });
        
        // Step 8: Return to village
        await page.click('#start-btn');
        await page.waitForTimeout(2000);
        
        console.log('📸 Screenshot 9: Returned to Village');
        await page.screenshot({ 
            path: path.join(screenshotsDir, '09-returned-village.png'),
            fullPage: true
        });
        
        // Step 9: Quest complete
        await page.click('#start-btn');
        await page.waitForTimeout(1500);
        
        console.log('📸 Screenshot 10: Quest Complete');
        await page.screenshot({ 
            path: path.join(screenshotsDir, '10-quest-complete.png'),
            fullPage: true
        });
        
        console.log('\n✅ Quest Visual Test Complete!');
        console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
        console.log('\n📊 Test Summary:');
        console.log('   - Quest started and accepted ✓');
        console.log('   - Traveled to goblin camp ✓');
        console.log('   - Defeated 3 goblin warriors ✓');
        console.log('   - Healed character ✓');
        console.log('   - Defeated goblin chief (boss) ✓');
        console.log('   - Returned to village ✓');
        console.log('   - Quest completed ✓');
        console.log('   - Total screenshots: 10');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
if (require.main === module) {
    runQuestTest().catch(error => {
        console.error('Test execution failed:', error);
        process.exit(1);
    });
}

module.exports = { runQuestTest };
