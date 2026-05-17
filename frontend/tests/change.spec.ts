import { test, expect } from '@playwright/test';

test.describe('Change Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/changes');
  });

  test('should create and then update a change request', async ({ page }) => {
    const testTitle = `Deployment Test ${Date.now()}`;
    const testImpact = 'Minor disruption to external API during switchover.';
    const testBackout = 'Switch back to the previous stable blue-green environment.';

    // 1. Navigate to Create Change
    await page.getByRole('button', { name: /New Change|新規変更申請/ }).click();
    await expect(page.getByRole('heading', { name: /Request New Change|新規変更の申請/ })).toBeVisible();

    // 2. Fill form and submit
    await page.getByLabel(/Change Title|変更のタイトル/).fill(testTitle);
    await page.getByLabel(/Change Type|変更タイプ/).selectOption('Normal');
    await page.getByLabel(/Impact Analysis|影響分析/).fill(testImpact);
    await page.getByLabel(/Backout Plan|切り戻し計画/).fill(testBackout);
    await page.getByRole('button', { name: /Request Change|変更を申請/ }).click();

    // 3. Verify in list and go to detail
    // Specifically look for the title within a table row to avoid matching input fields
    const row = page.locator('tr').filter({ hasText: testTitle });
    await expect(row).toBeVisible();
    await row.getByRole('button').click();

    // 4. Verify detail view
    await expect(page.getByRole('heading', { name: testTitle })).toBeVisible();
    await expect(page.getByText(testImpact)).toBeVisible();
    await expect(page.getByText(testBackout)).toBeVisible();

    // 5. Update status
    await page.getByLabel(/Status Management|ステータス管理/).selectOption('Approved');
    await page.getByRole('button', { name: /Update Status|ステータスを更新/ }).click();

    // 6. Verify success and status change
    await expect(page.getByText(/success|更新しました/i).first()).toBeVisible();
    
    const selectedValue = await page.getByLabel(/Status Management|ステータス管理/).inputValue();
    expect(['Approved', '承認済み']).toContain(selectedValue);
  });
});
