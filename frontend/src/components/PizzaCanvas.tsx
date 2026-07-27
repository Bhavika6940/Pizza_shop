'use client';

import React, { useMemo } from 'react';
import { Ingredient, SelectedIngredient } from '@/types';

interface PizzaCanvasProps {
  size: Ingredient;
  crust: Ingredient;
  sauce: Ingredient;
  cheese: Ingredient;
  toppings: SelectedIngredient[];
}

export const PizzaCanvas: React.FC<PizzaCanvasProps> = ({
  size,
  crust,
  sauce,
  cheese,
  toppings,
}) => {
  // Determine pixel size based on pizza size
  const canvasDimension = useMemo(() => {
    if (size.name.includes('Small')) return 300;
    if (size.name.includes('Large')) return 380;
    if (size.name.includes('Extra')) return 420;
    return 340; // Medium
  }, [size]);

  // Determine sauce color fill
  const sauceFill = useMemo(() => {
    if (sauce.name.includes('Alfredo')) return 'url(#sauce-alfredo)';
    if (sauce.name.includes('BBQ')) return 'url(#sauce-bbq)';
    if (sauce.name.includes('Pesto')) return 'url(#sauce-pesto)';
    if (sauce.name.includes('Arrabbiata')) return 'url(#sauce-arrabbiata)';
    return 'url(#sauce-tomato)'; // Default
  }, [sauce]);

  // Generate deterministic scattered positions for each topping
  const toppingElements = useMemo(() => {
    const elements: React.ReactNode[] = [];
    const radiusMax = (canvasDimension / 2) - 45;

    toppings.forEach(({ ingredient, quantity }) => {
      const name = ingredient.name.toLowerCase();
      // Total count based on quantity selection
      const count = Math.min(24, (quantity || 1) * 8);

      for (let i = 0; i < count; i++) {
        // Golden ratio spiral distribution for realistic topping scattering
        const angle = i * 2.39996 + (name.length * 7);
        const dist = Math.sqrt(i / count) * radiusMax;
        const x = (canvasDimension / 2) + dist * Math.cos(angle);
        const y = (canvasDimension / 2) + dist * Math.sin(angle);
        const rotation = (i * 47) % 360;

        elements.push(
          <g key={`${ingredient.id}-${i}`} transform={`translate(${x}, ${y}) rotate(${rotation})`}>
            {renderToppingIcon(name)}
          </g>
        );
      }
    });

    return elements;
  }, [toppings, canvasDimension]);

  return (
    <div className="relative flex items-center justify-center p-6 transition-all duration-500">
      {/* Background Ambient Pizza Glow */}
      <div 
        className="absolute rounded-full bg-gradient-to-r from-amber-500/20 to-red-500/20 blur-2xl animate-pulse-glow"
        style={{ width: canvasDimension + 40, height: canvasDimension + 40 }}
      />

      <svg
        width={canvasDimension}
        height={canvasDimension}
        viewBox={`0 0 ${canvasDimension} ${canvasDimension}`}
        className="relative z-10 filter drop-shadow-2xl transition-all duration-500"
      >
        <defs>
          {/* Gradients */}
          {/* Crust Gradients */}
          <radialGradient id="crust-handtossed" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#D98A3C" />
            <stop offset="85%" stopColor="#C47327" />
            <stop offset="100%" stopColor="#8C460D" />
          </radialGradient>

          <radialGradient id="crust-stuffed" cx="50%" cy="50%" r="50%">
            <stop offset="70%" stopColor="#E5A65D" />
            <stop offset="88%" stopColor="#FFEAA7" />
            <stop offset="100%" stopColor="#9C500F" />
          </radialGradient>

          <radialGradient id="crust-thin" cx="50%" cy="50%" r="50%">
            <stop offset="85%" stopColor="#C27A34" />
            <stop offset="100%" stopColor="#7A3B05" />
          </radialGradient>

          {/* Sauce Gradients */}
          <radialGradient id="sauce-tomato" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#C026D3" />
            <stop offset="40%" stopColor="#DC2626" />
            <stop offset="90%" stopColor="#991B1B" />
          </radialGradient>

          <radialGradient id="sauce-alfredo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="60%" stopColor="#FEF3C7" />
            <stop offset="95%" stopColor="#FDE68A" />
          </radialGradient>

          <radialGradient id="sauce-bbq" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#78350F" />
            <stop offset="70%" stopColor="#451A03" />
            <stop offset="100%" stopColor="#290E02" />
          </radialGradient>

          <radialGradient id="sauce-pesto" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#65A30D" />
            <stop offset="70%" stopColor="#4D7C0F" />
            <stop offset="100%" stopColor="#365314" />
          </radialGradient>

          <radialGradient id="sauce-arrabbiata" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#EF4444" />
            <stop offset="70%" stopColor="#B91C1C" />
            <stop offset="100%" stopColor="#7F1D1D" />
          </radialGradient>

          {/* Cheese Texture Pattern */}
          <radialGradient id="cheese-mozzarella" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#FDE047" stopOpacity="0.9" />
            <stop offset="95%" stopColor="#EAB308" stopOpacity="0.85" />
          </radialGradient>
        </defs>

        {/* 1. BASE DOUGH / CRUST LAYER */}
        <circle
          cx={canvasDimension / 2}
          cy={canvasDimension / 2}
          r={(canvasDimension / 2) - 5}
          fill={
            crust.name.includes('Stuffed')
              ? 'url(#crust-stuffed)'
              : crust.name.includes('Thin')
              ? 'url(#crust-thin)'
              : 'url(#crust-handtossed)'
          }
        />

        {/* Stuffed Crust Ring Detail */}
        {crust.name.includes('Stuffed') && (
          <circle
            cx={canvasDimension / 2}
            cy={canvasDimension / 2}
            r={(canvasDimension / 2) - 18}
            fill="none"
            stroke="#FEF9C3"
            strokeWidth="8"
            strokeDasharray="6 4"
            opacity="0.7"
          />
        )}

        {/* 2. SAUCE LAYER */}
        <circle
          cx={canvasDimension / 2}
          cy={canvasDimension / 2}
          r={(canvasDimension / 2) - 22}
          fill={sauceFill}
        />

        {/* Sauce herbs/specs */}
        <circle
          cx={canvasDimension / 2}
          cy={canvasDimension / 2}
          r={(canvasDimension / 2) - 24}
          fill="none"
          stroke="#000"
          strokeWidth="1.5"
          strokeDasharray="1 12"
          opacity="0.15"
        />

        {/* 3. CHEESE LAYER */}
        <circle
          cx={canvasDimension / 2}
          cy={canvasDimension / 2}
          r={(canvasDimension / 2) - 28}
          fill="url(#cheese-mozzarella)"
        />

        {/* Melted Cheese spots */}
        <g opacity="0.4">
          <circle cx={canvasDimension / 2 - 40} cy={canvasDimension / 2 - 30} r="18" fill="#FFF" />
          <circle cx={canvasDimension / 2 + 50} cy={canvasDimension / 2 + 20} r="22" fill="#FFF" />
          <circle cx={canvasDimension / 2 - 20} cy={canvasDimension / 2 + 60} r="25" fill="#FFF" />
          <circle cx={canvasDimension / 2 + 30} cy={canvasDimension / 2 - 50} r="20" fill="#FFF" />
        </g>

        {/* 4. SCATTERED TOPPINGS LAYER */}
        {toppingElements}

        {/* 5. OVERLAY SHINE / 8-SLICE CUT GUIDES */}
        <g stroke="rgba(255,255,255,0.07)" strokeWidth="1" strokeDasharray="3 3">
          <line x1={canvasDimension / 2} y1="10" x2={canvasDimension / 2} y2={canvasDimension - 10} />
          <line x1="10" y1={canvasDimension / 2} x2={canvasDimension - 10} y2={canvasDimension / 2} />
          <line x1="40" y1="40" x2={canvasDimension - 40} y2={canvasDimension - 40} />
          <line x1={canvasDimension - 40} y1="40" x2="40" y2={canvasDimension - 40} />
        </g>
      </svg>
    </div>
  );
};

// Render individual vector icons for toppings
function renderToppingIcon(name: string) {
  if (name.includes('pepperoni')) {
    return (
      <g>
        <circle r="13" fill="#B91C1C" stroke="#7F1D1D" strokeWidth="1.5" />
        <circle r="10" fill="#DC2626" />
        <circle cx="-3" cy="-3" r="1.5" fill="#FEF2F2" opacity="0.6" />
        <circle cx="4" cy="2" r="1.2" fill="#FEF2F2" opacity="0.4" />
      </g>
    );
  }
  if (name.includes('mushroom')) {
    return (
      <g transform="scale(0.9)">
        <path d="M-10,0 A10,10 0 0,1 10,0 Z" fill="#D4D4D8" stroke="#71717A" strokeWidth="1" />
        <rect x="-3" y="0" width="6" height="8" rx="2" fill="#E4E4E7" stroke="#71717A" strokeWidth="1" />
      </g>
    );
  }
  if (name.includes('bacon')) {
    return (
      <g transform="scale(0.85)">
        <path d="M-12,-4 Q-6,2 0,-4 Q6,-10 12,-4 L10,4 Q4,-2 -2,4 Q-8,10 -14,4 Z" fill="#991B1B" stroke="#450A0A" strokeWidth="1" />
        <path d="M-10,-2 Q-5,3 0,-2" stroke="#FCA5A5" strokeWidth="1.5" fill="none" />
      </g>
    );
  }
  if (name.includes('sausage')) {
    return (
      <g>
        <circle r="8" fill="#78350F" stroke="#451A03" strokeWidth="1" />
        <circle cx="2" cy="-2" r="2" fill="#92400E" />
      </g>
    );
  }
  if (name.includes('chicken')) {
    return (
      <path d="M-8,-6 L6,-8 L10,4 L-4,8 Z" fill="#FEF3C7" stroke="#D97706" strokeWidth="1.2" rx="2" />
    );
  }
  if (name.includes('pepper') || name.includes('bell')) {
    return (
      <path d="M-12,-4 C-6,-12 6,-12 12,-4 C10,4 -10,4 -12,-4 Z" fill="none" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" />
    );
  }
  if (name.includes('onion')) {
    return (
      <circle r="11" fill="none" stroke="#A855F7" strokeWidth="2.5" strokeDasharray="14 6" />
    );
  }
  if (name.includes('olive')) {
    return (
      <g>
        <circle r="9" fill="#18181B" stroke="#09090B" strokeWidth="1.5" />
        <circle r="4" fill="#E4E4E7" opacity="0.3" />
      </g>
    );
  }
  if (name.includes('jalapeño') || name.includes('jalapeno')) {
    return (
      <g>
        <circle r="9" fill="#15803D" stroke="#166534" strokeWidth="1.5" />
        <circle r="4" fill="#86EFAC" opacity="0.6" />
      </g>
    );
  }
  if (name.includes('basil')) {
    return (
      <path d="M0,-12 C8,-4 8,8 0,12 C-8,8 -8,-4 0,-12 Z" fill="#22C55E" stroke="#15803D" strokeWidth="1" />
    );
  }
  if (name.includes('tomato')) {
    return (
      <g>
        <circle r="11" fill="#EF4444" stroke="#991B1B" strokeWidth="1.5" />
        <circle r="6" fill="#FCA5A5" opacity="0.5" />
      </g>
    );
  }
  if (name.includes('truffle')) {
    return (
      <circle r="3" fill="#FDE047" opacity="0.8" />
    );
  }

  // Default generic topping item
  return (
    <circle r="6" fill="#F97316" stroke="#C2410C" strokeWidth="1" />
  );
}
