import { test, expect } from '@playwright/test';

test.describe('Problem Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/problems');
  });

  test('should create and then update a problem', async ({ page }) => {
    const testTitle = `Test Problem ${Date.now()}`;
    const testRootCause = 'Faulty network switch identified in Rack 4.';
    const testWorkaround = 'Rerouted traffic to Rack 5 switch.';

    // 1. Navigate to Create Problem
    await page.getByRole('button', { name: /New Problem|新規問題報告/ }).click();
    await expect(page.getByRole('heading', { name: /Report New Problem|新規問題の報告/ })).toBeVisible();

    // 2. Fill form and submit
    await page.getByLabel(/Problem Title|問題のタイトル/).fill(testTitle);
    await page.getByLabel(/Root Cause|根本原因/).fill(testRootCause);
    await page.getByLabel(/Workaround|回避策/).fill(testWorkaround);
    await page.getByRole('button', { name: /Report Problem|問題を報告/ }).click();

    // 3. Verify in list and go to detail
    const row = page.locator('tr').filter({ hasText: testTitle });
    await expect(row).toBeVisible();
    await row.getByRole('button').click();

    // 4. Verify detail view
    await expect(page.getByRole('heading', { name: testTitle })).toBeVisible();
    await expect(page.getByText(testRootCause)).toBeVisible();
    await expect(page.getByText(testWorkaround)).toBeVisible();

    // 5. Update status
    await page.getByLabel(/Status Management|ステータス管理/).selectOption('Identified');
    await page.getByRole('button', { name: /Update Status|ステータスを更新/ }).click();

    // 6. Verify success and status change
    await expect(page.getByText(/success|更新しました/i).first()).toBeVisible();
    // In Japanese it might be "特定済み"
    const selectedValue = await page.getByLabel(/Status Management|ステータス管理/).inputValue();
    expect(['Identified', '特定済み']).toContain(selectedValue);
  });
});
