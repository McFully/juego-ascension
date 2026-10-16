import { describe, it, expect } from 'vitest';
import {
  calcBuildingOperatingExpenses,
  calcResearchOperatingExpenses,
  calcShipOperatingExpenses,
  calcDefenseOperatingExpenses,
} from '../utils/formulas/operatingExpensesFormulas.js';
import { buildingProdInfo } from '../utils/formulas.js';
import { BUILDINGS } from '../data/catalog/index.js';

describe('Contrato de Estandarización de Tarjetas y Fórmulas Operativas (3 Bloques)', () => {
  describe('Bloque 2: Gastos Operativos y Censo en Edificios', () => {
    it('calcula censo, mantenimiento y salarios en cr/h y cr/día para nivel > 0', () => {
      const expenses = calcBuildingOperatingExpenses('metalMine', 5);
      expect(expenses.requiredStaff).toBeGreaterThan(0);
      expect(expenses.maintenanceCreditsHour).toBeGreaterThan(0);
      expect(expenses.maintenanceCreditsDay).toBe(expenses.maintenanceCreditsHour * 24);
      expect(expenses.salariesCreditsHour).toBeGreaterThan(0);
      expect(expenses.salariesCreditsDay).toBe(expenses.salariesCreditsHour * 24);
      expect(expenses.totalCreditsHour).toBe(expenses.maintenanceCreditsHour + expenses.salariesCreditsHour);
      expect(expenses.totalCreditsDay).toBe(expenses.totalCreditsHour * 24);
    });

    it('devuelve coste cero si el nivel es 0 o falsy', () => {
      const expenses = calcBuildingOperatingExpenses('crystalMine', 0);
      expect(expenses.requiredStaff).toBe(0);
      expect(expenses.maintenanceCreditsHour).toBe(0);
      expect(expenses.salariesCreditsHour).toBe(0);
      expect(expenses.totalCreditsHour).toBe(0);
      expect(expenses.totalCreditsDay).toBe(0);
    });

    it('soporta edificios de Lonja y Megaproyectos (exchangeBank, exchangeVaults, etc.)', () => {
      const bankExpenses = calcBuildingOperatingExpenses('exchangeBank', 3);
      expect(bankExpenses.requiredStaff).toBeGreaterThan(0);
      expect(bankExpenses.totalCreditsHour).toBeGreaterThan(0);
      expect(bankExpenses.maintenanceCreditsDay).toBe(bankExpenses.maintenanceCreditsHour * 24);
    });
  });

  describe('Bloque 2: Gastos Operativos e Investigaciones', () => {
    it('calcula científicos y mantenimiento para investigaciones activas', () => {
      const resExpenses = calcResearchOperatingExpenses('energyTech', 4);
      expect(resExpenses.requiredScientists).toBeGreaterThan(0);
      expect(resExpenses.maintenanceCreditsHour).toBeGreaterThan(0);
      expect(resExpenses.salariesCreditsDay).toBe(resExpenses.salariesCreditsHour * 24);
    });

    it('devuelve cero para nivel 0 de investigación', () => {
      const resExpenses = calcResearchOperatingExpenses('laserTech', 0);
      expect(resExpenses.requiredScientists).toBe(0);
      expect(resExpenses.totalCreditsHour).toBe(0);
    });
  });

  describe('Bloque 2: Gastos Operativos de Flota y Defensas', () => {
    it('calcula tripulación y mantenimiento naval para naves en servicio', () => {
      const shipExp = calcShipOperatingExpenses('cruiser', 10);
      expect(shipExp.crew).toBeGreaterThan(0);
      expect(shipExp.maintenanceCreditsHour).toBeGreaterThan(0);
      expect(shipExp.salariesCreditsHour).toBeGreaterThan(0);
      expect(shipExp.maintenanceCreditsDay).toBe(shipExp.maintenanceCreditsHour * 24);
    });

    it('calcula guarnición y mantenimiento para baterías de defensa', () => {
      const defExp = calcDefenseOperatingExpenses('plasmaTurret', 5);
      expect(defExp.garrison).toBeGreaterThan(0);
      expect(defExp.maintenanceCreditsHour).toBeGreaterThan(0);
      expect(defExp.totalCreditsDay).toBe(defExp.totalCreditsHour * 24);
    });
  });

  describe('Bloque 1: Cobertura de buildingProdInfo para Situación Actual y Delta', () => {
    it('proporciona métricas para todos los edificios canónicos sin crashear', () => {
      for (const bId of Object.keys(BUILDINGS)) {
        const info0 = buildingProdInfo(bId, 0);
        expect(info0).toBeDefined();
        expect(info0.current).toBeDefined();
        expect(info0.next).toBeDefined();

        const info5 = buildingProdInfo(bId, 5);
        expect(info5.current).toBeDefined();
        expect(info5.next).toBeDefined();
      }
    });

    it('proporciona métricas para edificios de Lonja y megaproyectos de Mando', () => {
      const exchangeIds = ['exchangeBank', 'exchangeVaults', 'exchangeDocks', 'exchangeEngine', 'exchangeBastion'];
      for (const id of exchangeIds) {
        const info = buildingProdInfo(id, 2);
        expect(info).toBeDefined();
        expect(info.current.statValue).toBeGreaterThan(0);
        expect(info.next.statValue).toBeGreaterThan(info.current.statValue);
        expect(info.deltaStat).toBeGreaterThan(0);
      }
    });
  });
});
