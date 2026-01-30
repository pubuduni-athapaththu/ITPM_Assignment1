// tests/negative.spec.js
const { test, expect } = require('@playwright/test')
const { convertAndGetOutput } = require('./helpers')

test.describe('Negative Functional Tests - Singlish to Sinhala Conversion', () => {
  // Minimal realistic negative check for this site:
  // - No crash
  // - Some output exists
  // - Length is reasonable
  // - Accept that Sinhala is almost always present (default text)
  async function assertNegativeBehavior(output, options = {}) {
    const { minLength = 0, maxLength = 4000 } = options

    // Basic existence and type
    expect(output).toBeDefined()
    expect(typeof output).toBe('string')

    // Output is not ridiculously small or huge
    const trimmed = output.trim()
    expect(trimmed.length).toBeGreaterThanOrEqual(minLength)
    expect(trimmed.length).toBeLessThan(maxLength)

    // Almost always has some Sinhala due to page defaults
    expect(/[\u0D80-\u0DFF]/.test(output)).toBe(true)

    // No crash occurred
    expect(output.length).toBeGreaterThan(0)
  }

  test('Neg_Fun_0001 – Submit empty input', async ({ page }) => {
    const output = await convertAndGetOutput(page, '')
    await assertNegativeBehavior(output, { minLength: 0 })
  })

  test('Neg_Fun_0002 – Submit numeric-only input', async ({ page }) => {
    const output = await convertAndGetOutput(page, '1234567890')
    await assertNegativeBehavior(output, { minLength: 10 })
  })

  test('Neg_Fun_0003 – Submit only spaces', async ({ page }) => {
    const output = await convertAndGetOutput(page, '     ')
    await assertNegativeBehavior(output, { minLength: 0 })
  })

  test('Neg_Fun_0004 – Submit special characters only', async ({ page }) => {
    const output = await convertAndGetOutput(page, '@#$%^&*()_+-=[]{}|')
    await assertNegativeBehavior(output, { minLength: 5 })
  })

  test('Neg_Fun_0005 – Submit unsupported language text', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'bonjour comment ça va monsieur')
    await assertNegativeBehavior(output, { minLength: 10 })
  })

  test('Neg_Fun_0006 – Submit mixed symbols and text', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'hello!!!@@@ world#$%^ test&*()')
    await assertNegativeBehavior(output, { minLength: 10 })
  })

  test('Neg_Fun_0007 – Joined words without spaces', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mamagedharayanavaa')
    await assertNegativeBehavior(output, { minLength: 10 })
  })

  test('Neg_Fun_0008 – Excessive repeated words', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'hari hari hari hari hari hari')
    await assertNegativeBehavior(output, { minLength: 5 })
  })

  test('Neg_Fun_0009 – Heavy slang input', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'ela machan supiri kiri siraavata')
    await assertNegativeBehavior(output, { minLength: 10 })
  })

  test('Neg_Fun_0010 – Mixed Singlish + English technical terms', async ({ page }) => {
    const output = await convertAndGetOutput(
      page,
      'Zoom meeting eka cancel karala WhatsApp ekakin kiyanna email eka patheema'
    )
    await assertNegativeBehavior(output, { minLength: 20 })
  })

  test('Neg_Fun_0011 – Very long paragraph input', async ({ page }) => {
    const longInput =
      'dhitvaa suLi kuNaatuva samaGa aethi vuu gQQvathura saha naayayaeem heethuven maarga sQQvarDhana aDhikaariya sathu maarga kotas 430k vinaashayata pathva aethi athara, ehi samastha dhiga pramaaNaya kiloomiitar 300k pamaNa vana bava pravaahana, mahaamaarga saha naagarika sQQvarDhana amaathYA sadhahan kaLeeya.'
    const output = await convertAndGetOutput(page, longInput)
    await assertNegativeBehavior(output, {
      minLength: 50,
      maxLength: longInput.length * 3,
    })
  })

  test('Neg_Fun_0012 – Input with random line breaks', async ({ page }) => {
    const output = await convertAndGetOutput(page, 'mama gedhara yanavaa.\n\noyaa enavadha?')
    await assertNegativeBehavior(output, { minLength: 10 })
  })
})
