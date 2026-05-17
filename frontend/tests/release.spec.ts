import { test, expect } from '@playwright/test';

test.describe('Release Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/releases');
  });

  test('should create and then update a release', async ({ page }) => {
    const testVersion = `2.${Date.now().toString().slice(-3)}.0`;
    const testNote = 'Major architectural update with ITIL modules.';

    // 1. Navigate to Create Release
    await page.getByRole('button', { name: /New Release|新規リリース計画/ }).click();
    await expect(page.getByRole('heading', { name: /Plan New Release|新規リリースの計画/ })).toBeVisible();

    // 2. Fill form and submit
    await page.getByLabel(/Version Number|バージョン番号/).fill(testVersion);
    await page.getByLabel(/Release Note|リリースノート/).fill(testNote);
    await page.getByRole('button', { name: /Plan Release|リリースを計画/ }).click();

    // 3. Verify in list and go to detail
    const row = page.locator('tr').filter({ hasText: testVersion });
    await expect(row).toBeVisible();
    await row.getByRole('button').click();

    // 4. Verify detail view
    await expect(page.getByRole('heading', { name: new RegExp(`(Version|バージョン)\\s*${testVersion}`) })).toBeVisible();
    await expect(page.getByText(testNote)).toBeVisible();

    // 5. Update status
    await page.getByLabel(/Release Lifecycle|リリースライフサイクル/).selectOption('Building');
    await page.getByRole('button', { name: /Update Status|ステータスを更新/ }).click();

    // 6. Verify success and status change
    await expect(page.getByText(/success|更新しました/i).first()).toBeVisible();
    
    const selectedValue = await page.getByLabel(/Release Lifecycle|リリースライフサイクル/).inputValue();
    expect(['Building', 'ビルド中']).toContain(selectedValue);
  });
});
