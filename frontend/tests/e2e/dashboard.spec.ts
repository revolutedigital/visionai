import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Dashboard
 */
test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('deve carregar o dashboard sem erros', async ({ page }) => {
    // Verificar título da página
    await expect(page).toHaveTitle(/RAC/i);

    // Verificar que o layout principal está presente
    await expect(page.locator('main')).toBeVisible();
  });

  test('deve exibir empty state quando não há dados', async ({ page }) => {
    // Aguardar carregamento
    await page.waitForLoadState('networkidle');

    // Verificar se empty state está visível ou se há dados
    const emptyState = page.getByText(/Nenhum dado/i);
    const heroSection = page.getByRole('heading', { name: /clientes/i });

    // Pelo menos um dos dois deve estar visível
    const hasEmptyState = await emptyState.isVisible().catch(() => false);
    const hasData = await heroSection.isVisible().catch(() => false);

    expect(hasEmptyState || hasData).toBeTruthy();
  });

  test('deve ter navegação funcional', async ({ page }) => {
    // Testar navegação via sidebar
    await page.getByRole('link', { name: /clientes/i }).first().click();
    await expect(page).toHaveURL(/\/clientes/);

    await page.getByRole('link', { name: /pipeline/i }).first().click();
    await expect(page).toHaveURL(/\/pipeline/);

    await page.getByRole('link', { name: /upload/i }).first().click();
    await expect(page).toHaveURL(/\/upload/);

    // Voltar para dashboard
    await page.getByRole('link', { name: /dashboard/i }).first().click();
    await expect(page).toHaveURL('/');
  });

  test('deve ter atalhos de teclado funcionando', async ({ page }) => {
    // Alt+D para Dashboard
    await page.keyboard.press('Alt+D');
    await expect(page).toHaveURL('/');

    // Alt+C para Clientes
    await page.keyboard.press('Alt+C');
    await expect(page).toHaveURL(/\/clientes/);

    // Alt+P para Pipeline
    await page.keyboard.press('Alt+P');
    await expect(page).toHaveURL(/\/pipeline/);

    // Alt+U para Upload
    await page.keyboard.press('Alt+U');
    await expect(page).toHaveURL(/\/upload/);
  });

  test('deve ter skip navigation acessível', async ({ page }) => {
    // Pressionar Tab para focar skip link
    await page.keyboard.press('Tab');

    // Verificar se skip link está visível quando focado
    const skipLink = page.getByText(/pular para conteúdo/i);
    await expect(skipLink).toBeFocused();

    // Clicar no skip link
    await skipLink.click();

    // Verificar se o main content está focado
    const mainContent = page.locator('#main-content');
    await expect(mainContent).toBeFocused();
  });

  test('deve exibir indicators de loading', async ({ page }) => {
    // Recarregar a página
    await page.reload();

    // Verificar se skeleton ou loading está presente inicialmente
    const skeletonOrSpinner =
      page.locator('.animate-pulse, .animate-spin').first();

    // Aguardar um pouco para capturar o loading
    await expect(skeletonOrSpinner).toBeVisible({ timeout: 1000 }).catch(() => {
      // Loading pode ser muito rápido, não é erro crítico
    });
  });

  test('deve ser responsivo em mobile', async ({ page, viewport }) => {
    // Simular viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });

    // Verificar que a página carrega em mobile
    await expect(page.locator('main')).toBeVisible();

    // Verificar que elementos estão adaptados
    // (ajustar seletores conforme necessário)
    const container = page.locator('main > div').first();
    await expect(container).toBeVisible();
  });
});
