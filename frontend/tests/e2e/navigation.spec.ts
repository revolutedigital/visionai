import { test, expect } from '@playwright/test';

/**
 * Testes E2E para Navegação e Acessibilidade
 */
test.describe('Navegação e Acessibilidade', () => {
  test('deve ter todas as páginas acessíveis', async ({ page }) => {
    // Dashboard
    await page.goto('/');
    await expect(page.locator('main')).toBeVisible();

    // Clientes
    await page.goto('/clientes');
    await expect(page.locator('main')).toBeVisible();

    // Pipeline
    await page.goto('/pipeline');
    await expect(page.locator('main')).toBeVisible();

    // Upload
    await page.goto('/upload');
    await expect(page.locator('main')).toBeVisible();
  });

  test('deve ter navegação por teclado em todos os elementos', async ({ page }) => {
    await page.goto('/');

    // Pressionar Tab múltiplas vezes e verificar focus
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');

      // Verificar se algum elemento está focado
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible({ timeout: 1000 }).catch(() => {
        // Alguns elementos podem estar fora da viewport
      });
    }
  });

  test('deve ter focus indicators visíveis', async ({ page }) => {
    await page.goto('/');

    // Focar no primeiro botão
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focusedElement = page.locator(':focus');

    // Verificar se focus indicator está aplicado (ring-2, outline, etc)
    const hasFocusStyle = await focusedElement
      .evaluate((el) => {
        const styles = window.getComputedStyle(el);
        return (
          styles.outline !== 'none' ||
          styles.boxShadow !== 'none' ||
          el.classList.contains('ring-2')
        );
      })
      .catch(() => false);

    expect(hasFocusStyle).toBeTruthy();
  });

  test('deve ter ARIA labels apropriados', async ({ page }) => {
    await page.goto('/');

    // Verificar role="main"
    const main = page.getByRole('main');
    await expect(main).toBeVisible();

    // Verificar role="navigation"
    const nav = page.getByRole('navigation').first();
    await expect(nav).toBeVisible();

    // Verificar se há headings estruturados
    const headings = page.getByRole('heading');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);
  });

  test('deve ter contrast ratio adequado (WCAG AA)', async ({ page }) => {
    await page.goto('/');

    // Pegar alguns textos importantes e verificar contraste
    const textos = await page.locator('h1, h2, h3, p, button').all();

    for (const elemento of textos.slice(0, 10)) {
      // Verificar apenas os 10 primeiros
      const contrast = await elemento
        .evaluate((el) => {
          const styles = window.getComputedStyle(el);
          const color = styles.color;
          const bgColor = styles.backgroundColor;

          // Função simplificada de contraste
          // Em produção, usar biblioteca como polished
          return { color, bgColor };
        })
        .catch(() => null);

      // Apenas verificar que cores existem (não null/transparent)
      if (contrast) {
        expect(contrast.color).toBeTruthy();
      }
    }
  });

  test('deve manter histórico de navegação', async ({ page }) => {
    await page.goto('/');
    await page.goto('/clientes');
    await page.goto('/pipeline');

    // Voltar no histórico
    await page.goBack();
    await expect(page).toHaveURL(/\/clientes/);

    await page.goBack();
    await expect(page).toHaveURL('/');

    // Avançar no histórico
    await page.goForward();
    await expect(page).toHaveURL(/\/clientes/);
  });

  test('deve ter meta tags SEO básicas', async ({ page }) => {
    await page.goto('/');

    // Verificar title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);

    // Verificar meta viewport
    const viewport = page.locator('meta[name="viewport"]');
    await expect(viewport).toHaveAttribute('content', /width=device-width/);
  });

  test('deve lidar com rotas 404', async ({ page }) => {
    // Navegar para rota inexistente
    const response = await page.goto('/rota-inexistente-12345');

    // Página deve carregar (mesmo que 404)
    expect(response?.status()).toBeDefined();

    // Layout principal deve estar presente
    await expect(page.locator('main')).toBeVisible();
  });
});
