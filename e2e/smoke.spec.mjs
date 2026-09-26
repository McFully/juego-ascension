import { test, expect } from "@playwright/test";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ygtyrjfnxjwfysekhurv.supabase.co";
const ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlndHlyamZueGp3ZnlzZWtodXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk5MzMxMzgsImV4cCI6MjEwNTUwOTEzOH0.CoIjkKAAgt4ZLlqzOrh4kEFjB6KXygroeEYHj0X2lAQ";

async function sessionFromPage(page) {
  return page.evaluate(() => {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("sb-") && k.endsWith("-auth-token")) {
        try {
          const v = JSON.parse(localStorage.getItem(k));
          const s = (v && (v.currentSession || v.session)) || v;
          if (s && s.user && s.user.id && s.access_token) {
            return {
              access_token: s.access_token,
              refresh_token: s.refresh_token,
              user: s.user,
            };
          }
        } catch (_) {}
      }
    }
    return null;
  });
}

test("smoke: logo, menú online, crear expedición, autosave en Supabase, recargar y continuar", async ({ page }) => {
  const problems = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error") problems.push(`console: ${msg.text()}`);
  });

  await page.goto("/");

  // 1. Splash de arranque: logo + red online activa
  await expect(page.getByAltText("Ascensión").first()).toBeVisible({ timeout: 15000 });
  await expect(page.getByText("RED ONLINE ACTIVADA")).toBeVisible();

  // 2. Menú principal (watchdog de 10s: si se queda atascado, pulsar Continuar)
  const menuButton = page.getByRole("button", { name: /Nueva Expedición/ });
  try {
    await expect(menuButton).toBeVisible({ timeout: 20000 });
  } catch (_) {
    const force = page.getByRole("button", { name: "Continuar", exact: true });
    if (await force.isVisible()) {
      await force.click();
      await expect(menuButton).toBeVisible({ timeout: 20000 });
    } else {
      throw _;
    }
  }

  // Piloto Invitado + botón Cuenta Online visibles
  await expect(page.getByText("Piloto: Invitado")).toBeVisible();
  await expect(page.getByRole("button", { name: /Cuenta Online/ })).toBeVisible();

  // 3. Crear una nueva expedición
  await menuButton.click();
  const nameInput = page.getByPlaceholder("NOMBRE CLAVE");
  await expect(nameInput).toBeVisible({ timeout: 15000 });
  await nameInput.fill("E2E Commander");
  await page.getByRole("button", { name: /Comenzar Simulación/ }).click();

  // 4. En partida: los recursos del planeta aparecen
  await expect(page.getByText("Metal").first()).toBeVisible({ timeout: 30000 });

  // 5. Autosave (cada 30s): esperar a que la fila llegue a Supabase con el usuario anónimo
  const session = await sessionFromPage(page);
  expect(session, "sesión anónima persistida en localStorage").toBeTruthy();
  const client = createClient(SUPABASE_URL, ANON_KEY);
  await client.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });

  let saveRow = null;
  for (let i = 0; i < 30; i++) {
    const { data } = await client.from("saves").select("slug, player_name").eq("user_id", session.user.id);
    if (data && data.length > 0) {
      saveRow = data[0];
      break;
    }
    await page.waitForTimeout(3000);
  }
  expect(saveRow, "autosave debe crear una fila en saves").toBeTruthy();

  // 6. Recargar: Continuar Partida habilitado, cargamos de nuevo la partida
  await page.reload();
  await expect(page.getByRole("button", { name: /Nueva Expedición/ })).toBeVisible({ timeout: 30000 });
  const continueBtn = page.getByRole("button", { name: /Continuar Partida/ });
  await expect(continueBtn).toBeEnabled({ timeout: 30000 });
  await continueBtn.click();
  await expect(page.getByText("Metal").first()).toBeVisible({ timeout: 30000 });

  // 7. Sin errores de consola ni excepciones de página
  expect(problems).toEqual([]);

  // 8. Limpieza: borrar las partidas de este usuario anónimo de prueba
  await client.from("saves").delete().eq("user_id", session.user.id);
});
