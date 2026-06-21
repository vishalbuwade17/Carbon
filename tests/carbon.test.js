import { describe, it, expect } from 'vitest';
import { calculateFootprint } from '../server/routes/carbon.js';

describe('Carbon Footprint Calculator Logic', () => {
  it('calculates baseline values correctly when inputs are zero or empty', () => {
    const inputs = {
      carMiles: 0,
      flightsCount: 0,
      electricityKwh: 0,
      dietType: 'average',
      waterGallons: 0,
      wasteKg: 0
    };
    const emissions = calculateFootprint(inputs);
    expect(emissions.transportation).toBe(0);
    expect(emissions.electricity).toBe(0);
    expect(emissions.food).toBe(150); // standard baseline average diet
    expect(emissions.water).toBe(0);
    expect(emissions.waste).toBe(0);
    expect(emissions.total).toBe(150);
  });

  it('calculates correct values for customized parameters', () => {
    const inputs = {
      carMiles: 500,        // 500 * 0.404 = 202 kg
      flightsCount: 2,       // 2 * 220 = 440 kg (trans total = 642 kg)
      electricityKwh: 400,   // 400 * 0.85 = 340 kg
      dietType: 'vegan',     // vegan = 60 kg
      waterGallons: 1000,    // 1000 * 0.003 = 3 kg
      wasteKg: 10            // 10 * 0.9 = 9 kg
    };
    const emissions = calculateFootprint(inputs);
    expect(emissions.transportation).toBe(642);
    expect(emissions.electricity).toBe(340);
    expect(emissions.food).toBe(60);
    expect(emissions.water).toBe(3);
    expect(emissions.waste).toBe(9);
    expect(emissions.total).toBe(1054); // 642 + 340 + 60 + 3 + 9
  });

  it('adjusts emissions correctly based on diet profiles', () => {
    const categories = [
      { type: 'vegan', expected: 60 },
      { type: 'vegetarian', expected: 90 },
      { type: 'pescatarian', expected: 114 },
      { type: 'average', expected: 150 },
      { type: 'meat-heavy', expected: 225 }
    ];

    categories.forEach(cat => {
      const inputs = { dietType: cat.type };
      const emissions = calculateFootprint(inputs);
      expect(emissions.food).toBe(cat.expected);
    });
  });
});
