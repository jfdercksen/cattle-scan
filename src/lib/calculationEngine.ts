/**
 * Calculation Engine for Livestock Trading Platform
 * Handles automated calculations and validations for livestock requirements
 */

export interface MouthingRequirement {
  totalCattle: number;
  requiredPercentage: number;
  requiredCount: number;
  displayText: string;
}

export interface FeeCalculation {
  baseFee: number;
  additionalFee: number;
  totalFee: number;
  description: string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

export interface CalculationEngine {
  calculateMouthingRequirement(totalCattle: number): MouthingRequirement;
  calculateAdditionalFees(turnover: number): FeeCalculation;
  validatePercentageCompliance(required: number, actual: number): ValidationResult;
}

/**
 * Default implementation of the calculation engine
 */
export class DefaultCalculationEngine implements CalculationEngine {
  
  /**
   * Calculate mouthing requirements based on total cattle count
   * Standard requirement is 25% of total cattle must be mouthed
   */
  calculateMouthingRequirement(totalCattle: number): MouthingRequirement {
    if (totalCattle <= 0) {
      return {
        totalCattle: 0,
        requiredPercentage: 0,
        requiredCount: 0,
        displayText: 'No cattle specified'
      };
    }

    const requiredPercentage = 25; // 25% standard requirement
    const requiredCount = Math.ceil((totalCattle * requiredPercentage) / 100);
    
    return {
      totalCattle,
      requiredPercentage,
      requiredCount,
      displayText: `${requiredCount} cattle must be mouthed (${requiredPercentage}% of ${totalCattle} total cattle)`
    };
  }

  /**
   * Calculate additional fees based on company turnover
   * Companies under 10 million turnover pay additional 25 rand per car
   */
  calculateAdditionalFees(turnover: number): FeeCalculation {
    const threshold = 10_000_000; // 10 million rand threshold
    const additionalFeePerCar = 25; // 25 rand per car
    
    if (turnover < threshold) {
      return {
        baseFee: 0,
        additionalFee: additionalFeePerCar,
        totalFee: additionalFeePerCar,
        description: `Additional R${additionalFeePerCar} per car (turnover under R${threshold.toLocaleString()})`
      };
    }

    return {
      baseFee: 0,
      additionalFee: 0,
      totalFee: 0,
      description: 'No additional fees (turnover above threshold)'
    };
  }

  /**
   * Validate that actual percentage meets required percentage
   */
  validatePercentageCompliance(required: number, actual: number): ValidationResult {
    if (actual >= required) {
      return {
        isValid: true,
        message: `Compliance met: ${actual} meets requirement of ${required}`,
        severity: 'info'
      };
    }

    const shortfall = required - actual;
    if (shortfall <= 2) {
      return {
        isValid: false,
        message: `Minor shortfall: ${actual} provided, ${required} required (${shortfall} short)`,
        severity: 'warning'
      };
    }

    return {
      isValid: false,
      message: `Significant shortfall: ${actual} provided, ${required} required (${shortfall} short)`,
      severity: 'error'
    };
  }
}

/**
 * Singleton instance of the calculation engine
 */
export const calculationEngine = new DefaultCalculationEngine();

/**
 * Utility functions for livestock calculations
 */
export const LivestockCalculations = {
  /**
   * Calculate total livestock from loading points
   */
  calculateTotalLivestock(loadingPoints: Array<{ number_of_cattle?: number; number_of_sheep?: number }>): {
    totalCattle: number;
    totalSheep: number;
    totalLivestock: number;
  } {
    const totalCattle = loadingPoints.reduce((sum, point) => sum + (point.number_of_cattle || 0), 0);
    const totalSheep = loadingPoints.reduce((sum, point) => sum + (point.number_of_sheep || 0), 0);
    
    return {
      totalCattle,
      totalSheep,
      totalLivestock: totalCattle + totalSheep
    };
  },

  /**
   * Determine livestock type based on cattle and sheep counts
   */
  determineLivestockType(cattleCount: number, sheepCount: number): 'CATTLE' | 'SHEEP' | 'CATTLE AND SHEEP' | null {
    const hasCattle = cattleCount > 0;
    const hasSheep = sheepCount > 0;

    if (hasCattle && hasSheep) {
      return 'CATTLE AND SHEEP';
    } else if (hasCattle) {
      return 'CATTLE';
    } else if (hasSheep) {
      return 'SHEEP';
    }

    return null;
  },

  /**
   * Check if cattle-related fields should be visible
   */
  shouldShowCattleFields(cattleCount: number): boolean {
    return cattleCount > 0;
  },

  /**
   * Check if sheep-related fields should be visible
   */
  shouldShowSheepFields(sheepCount: number): boolean {
    return sheepCount > 0;
  }
};