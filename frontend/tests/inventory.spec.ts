import { test, expect } from '@playwright/test';

test.describe('CI Inventory E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventory');
  });

  test('should display inventory list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /CI Inventory|構成アイテム一覧/ })).toBeVisible();
    
    // Check if table headers exist
    await expect(page.getByText(/CI Name|アイテム名/)).toBeVisible();
    await expect(page.getByText(/Type|種別/)).toBeVisible();
  });

  test('should show "no items" state initially if empty', async ({ page }) => {
    // If the database is empty, this should show. 
    // In a real environment we might mock or seed data, but here we just check if the UI behaves.
    const noItems = page.getByText(/No configuration items found|構成アイテムが見つかりませんでした/);
    const hasItems = page.locator('tbody tr').first();
    
    if (await hasItems.count() > 0) {
      await expect(hasItems).toBeVisible();
    } else {
      await expect(noItems).toBeVisible();
    }
  });
});
