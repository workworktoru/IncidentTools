import { test, expect } from '@playwright/test';

test.describe('AI Search E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/search');
  });

  test('should perform AI search', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /AI Knowledge Search|AI ナレッジ検索/ })).toBeVisible();
    
    const searchInput = page.getByPlaceholder(/Describe the issue|自然な文章で入力してください/);
    await searchInput.fill('Network issue in the office');
    await page.getByRole('button', { name: /Search|検索/ }).click();
    
    // It should show either results or "no results" but not stay loading forever
    await expect(page.getByText(/Searching|検索中/)).not.toBeVisible({ timeout: 10000 });
    
    const resultsCount = page.getByText(/similar incidents|件の類似インシデント/);
    const noResults = page.getByText(/No similar incidents found|該当する類似インシデントは見つかりませんでした/);
    
    await expect(resultsCount.or(noResults)).toBeVisible();
  });
});
