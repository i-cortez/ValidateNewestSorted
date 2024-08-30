const { test, expect } = require('@playwright/test');

test(
    "hacker news newest articles in sorted order test",
    async ({page}) => {
        // navigate to Hacker News "new" page
        await page.goto('https://news.ycombinator.com/newest');

        // unfortunately hacker news only lets us access 30 articles
        // at any given time on the "new" page
        //
        // initially we are given articles 1 - 30
        // if we want to see more articles we press on the more link
        // at the bottom of the page and the table will repopulate with
        // articles 31 - 60 and so on
        const timeStamps = []
        const timeStampsMaxSize = 100
        let loadArticles = true

        // due to the aformentioned constraint we need to fill the timeStamps
        // array with 30 articles at a time up to the timeStampsMaxSize limit
        while(loadArticles) {
            // get an array of the next 30 article timestamps
            const locator = page.locator(".age")
            const next30 = await locator.evaluateAll(
                (elements) => {
                    return elements.map(
                        (el) => {
                            return new Date(el.getAttribute("title"))
                        }
                    )
                }
            )
            // add the next 30 timestamps to the timestamps array
            // up to the defined limit
            for(let i = 0; i < next30.length; ++i) {
                timeStamps.push(next30[i])
                if(timeStamps.length >= timeStampsMaxSize) {
                    loadArticles = false
                    break
                }
            }
            
            // press the more button if we still need to load more articles
            // we add more articles if timeStamps has not reached it's limit
            if(loadArticles) {
                await page.locator(".morelink").click()
            }
        }

        // check if the dates are sorted in descending order
        // the newer articles have greater time values than those before
        const checkSortedDescending = function(arr) {
            for(let i = 1; i < arr.length - 1; ++i) {
                if(arr[i] < arr[i + 1]) {
                    return false
                }
            }
            return true
        }
        
        // since hacker news displays the newest articles at the top
        // we expect for isSorted to return true
        const isSorted = checkSortedDescending(timeStamps)
        expect(isSorted).toBe(true)

        // to help with debugging
        // console.log(timeStamps.length + " articles sorted?: " + isSorted)
        // console.log(timeStamps)
    }
)
