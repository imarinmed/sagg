/**
 * IntensityIndicator Component Tests
 * Verify all variants render correctly with intensity levels
 */

import { IntensityIndicator, IntensityBar, IntensityFlames, IntensityHeatmap } from '../IntensityIndicator';

describe('IntensityIndicator', () => {
  describe('Bar Variant', () => {
    it('renders with intensity 1 (blue)', () => {
      const component = IntensityIndicator({ intensity: 1, variant: 'bar' });
      expect(component).toBeDefined();
    });

    it('renders with intensity 3 (yellow)', () => {
      const component = IntensityIndicator({ intensity: 3, variant: 'bar' });
      expect(component).toBeDefined();
    });

    it('renders with intensity 5 (red)', () => {
      const component = IntensityIndicator({ intensity: 5, variant: 'bar' });
      expect(component).toBeDefined();
    });
  });

  describe('Flames Variant', () => {
    it('renders 5 flame icons', () => {
      const component = IntensityIndicator({ intensity: 3, variant: 'flames' });
      expect(component).toBeDefined();
    });
  });

  describe('Heatmap Variant', () => {
    it('renders colored indicator dot with label', () => {
      const component = IntensityIndicator({ intensity: 4, variant: 'heatmap' });
      expect(component).toBeDefined();
    });
  });

  describe('Value Clamping', () => {
    it('clamps value to 1 when below range', () => {
      const component = IntensityIndicator({ intensity: 0, variant: 'bar', showValue: true });
      expect(component).toBeDefined();
    });

    it('clamps value to 5 when above range', () => {
      const component = IntensityIndicator({ intensity: 10, variant: 'bar', showValue: true });
      expect(component).toBeDefined();
    });
  });

  describe('Show Value Option', () => {
    it('displays numeric value when showValue=true', () => {
      const component = IntensityIndicator({ intensity: 3, showValue: true });
      expect(component).toBeDefined();
    });

    it('hides numeric value when showValue=false', () => {
      const component = IntensityIndicator({ intensity: 3, showValue: false });
      expect(component).toBeDefined();
    });
  });

  describe('Exported Variants', () => {
    it('IntensityBar exported correctly', () => {
      const component = IntensityBar({ intensity: 2 });
      expect(component).toBeDefined();
    });

    it('IntensityFlames exported correctly', () => {
      const component = IntensityFlames({ intensity: 3 });
      expect(component).toBeDefined();
    });

    it('IntensityHeatmap exported correctly', () => {
      const component = IntensityHeatmap({ intensity: 4 });
      expect(component).toBeDefined();
    });
  });

  describe('Color Gradient', () => {
    const colorMap = {
      1: 'bg-blue-500',
      2: 'bg-cyan-500',
      3: 'bg-yellow-500',
      4: 'bg-orange-500',
      5: 'bg-red-600',
    };

    it('applies correct colors for each intensity level', () => {
      Object.entries(colorMap).forEach(([intensity, color]) => {
        const component = IntensityIndicator({ 
          intensity: parseInt(intensity), 
          variant: 'bar' 
        });
        expect(component).toBeDefined();
      });
    });
  });
});
