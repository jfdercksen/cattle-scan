import { describe, it, expect } from 'vitest';
import { 
  DefaultCalculationEngine, 
  LivestockCalculations,
  type MouthingRequirement,
  type FeeCalculation,
  type ValidationResult
} from '../calculationEngine';

describe('DefaultCalculationEngine', () => {
  const engine = new DefaultCalculationEngine();

  describe('calculateMouthingRequirement', () => {
    it('should calculate 25% mouthing requirement correctly', () => {
      const result: MouthingRequirement = engine.calculateMouthingRequirement(100);
      
      expect(result.totalCattle).toBe(100);
      expect(result.requiredPercentage).toBe(25);
      expect(result.requiredCount).toBe(25);
      expect(result.displayText).toBe('25 cattle must be mouthed (25% of 100 total cattle)');
    });

    it('should round up for fractional requirements', () => {
      const result: MouthingRequirement = engine.calculateMouthingRequirement(10);
      
      expect(result.requiredCount).toBe(3); // 25% of 10 = 2.5, rounded up to 3
      expect(result.displayText).toBe('3 cattle must be mouthed (25% of 10 total cattle)');
    });

    it('should handle zero cattle', () => {
      const result: MouthingRequirement = engine.calculateMouthingRequirement(0);
      
      expect(result.totalCattle).toBe(0);
      expect(result.requiredPercentage).toBe(0);
      expect(result.requiredCount).toBe(0);
      expect(result.displayText).toBe('No cattle specified');
    });

    it('should handle negative cattle count', () => {
      const result: MouthingRequirement = engine.calculateMouthingRequirement(-5);
      
      expect(result.totalCattle).toBe(0);
      expect(result.requiredPercentage).toBe(0);
      expect(result.requiredCount).toBe(0);
      expect(result.displayText).toBe('No cattle specified');
    });
  });

  describe('calculateAdditionalFees', () => {
    it('should charge additional fee for turnover under 10 million', () => {
      const result: FeeCalculation = engine.calculateAdditionalFees(5_000_000);
      
      expect(result.baseFee).toBe(0);
      expect(result.additionalFee).toBe(25);
      expect(result.totalFee).toBe(25);
      expect(result.description).toBe('Additional R25 per car (turnover under R10,000,000)');
    });

    it('should not charge additional fee for turnover above 10 million', () => {
      const result: FeeCalculation = engine.calculateAdditionalFees(15_000_000);
      
      expect(result.baseFee).toBe(0);
      expect(result.additionalFee).toBe(0);
      expect(result.totalFee).toBe(0);
      expect(result.description).toBe('No additional fees (turnover above threshold)');
    });

    it('should not charge additional fee for turnover exactly at 10 million', () => {
      const result: FeeCalculation = engine.calculateAdditionalFees(10_000_000);
      
      expect(result.additionalFee).toBe(0);
      expect(result.description).toBe('No additional fees (turnover above threshold)');
    });
  });

  describe('validatePercentageCompliance', () => {
    it('should validate when actual meets requirement', () => {
      const result: ValidationResult = engine.validatePercentageCompliance(25, 25);
      
      expect(result.isValid).toBe(true);
      expect(result.severity).toBe('info');
      expect(result.message).toBe('Compliance met: 25 meets requirement of 25');
    });

    it('should validate when actual exceeds requirement', () => {
      const result: ValidationResult = engine.validatePercentageCompliance(25, 30);
      
      expect(result.isValid).toBe(true);
      expect(result.severity).toBe('info');
      expect(result.message).toBe('Compliance met: 30 meets requirement of 25');
    });

    it('should show warning for minor shortfall', () => {
      const result: ValidationResult = engine.validatePercentageCompliance(25, 24);
      
      expect(result.isValid).toBe(false);
      expect(result.severity).toBe('warning');
      expect(result.message).toBe('Minor shortfall: 24 provided, 25 required (1 short)');
    });

    it('should show error for significant shortfall', () => {
      const result: ValidationResult = engine.validatePercentageCompliance(25, 20);
      
      expect(result.isValid).toBe(false);
      expect(result.severity).toBe('error');
      expect(result.message).toBe('Significant shortfall: 20 provided, 25 required (5 short)');
    });
  });
});

describe('LivestockCalculations', () => {
  describe('calculateTotalLivestock', () => {
    it('should calculate totals from loading points', () => {
      const loadingPoints = [
        { number_of_cattle: 50, number_of_sheep: 20 },
        { number_of_cattle: 30, number_of_sheep: 10 },
        { number_of_cattle: 20, number_of_sheep: 0 }
      ];

      const result = LivestockCalculations.calculateTotalLivestock(loadingPoints);

      expect(result.totalCattle).toBe(100);
      expect(result.totalSheep).toBe(30);
      expect(result.totalLivestock).toBe(130);
    });

    it('should handle undefined values', () => {
      const loadingPoints = [
        { number_of_cattle: undefined, number_of_sheep: 20 },
        { number_of_cattle: 30, number_of_sheep: undefined }
      ];

      const result = LivestockCalculations.calculateTotalLivestock(loadingPoints);

      expect(result.totalCattle).toBe(30);
      expect(result.totalSheep).toBe(20);
      expect(result.totalLivestock).toBe(50);
    });

    it('should handle empty loading points', () => {
      const result = LivestockCalculations.calculateTotalLivestock([]);

      expect(result.totalCattle).toBe(0);
      expect(result.totalSheep).toBe(0);
      expect(result.totalLivestock).toBe(0);
    });
  });

  describe('determineLivestockType', () => {
    it('should return CATTLE for cattle only', () => {
      const result = LivestockCalculations.determineLivestockType(50, 0);
      expect(result).toBe('CATTLE');
    });

    it('should return SHEEP for sheep only', () => {
      const result = LivestockCalculations.determineLivestockType(0, 30);
      expect(result).toBe('SHEEP');
    });

    it('should return CATTLE AND SHEEP for both', () => {
      const result = LivestockCalculations.determineLivestockType(50, 30);
      expect(result).toBe('CATTLE AND SHEEP');
    });

    it('should return null for no livestock', () => {
      const result = LivestockCalculations.determineLivestockType(0, 0);
      expect(result).toBe(null);
    });
  });

  describe('shouldShowCattleFields', () => {
    it('should show cattle fields when cattle count > 0', () => {
      expect(LivestockCalculations.shouldShowCattleFields(1)).toBe(true);
      expect(LivestockCalculations.shouldShowCattleFields(50)).toBe(true);
    });

    it('should hide cattle fields when cattle count = 0', () => {
      expect(LivestockCalculations.shouldShowCattleFields(0)).toBe(false);
    });
  });

  describe('shouldShowSheepFields', () => {
    it('should show sheep fields when sheep count > 0', () => {
      expect(LivestockCalculations.shouldShowSheepFields(1)).toBe(true);
      expect(LivestockCalculations.shouldShowSheepFields(30)).toBe(true);
    });

    it('should hide sheep fields when sheep count = 0', () => {
      expect(LivestockCalculations.shouldShowSheepFields(0)).toBe(false);
    });
  });
});