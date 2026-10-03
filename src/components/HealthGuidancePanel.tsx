import React, { useState } from 'react';
import {
  HeartPulse,
  Users,
  Baby,
  UserCheck,
  Activity,
  HardHat,
  ShieldAlert,
  ShieldCheck,
  Wind,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { AirStation, AQIStandard } from '../types';
import { getAQICategory, getHealthGuideline } from '../utils/aqiCalculators';

interface HealthGuidancePanelProps {
  station: AirStation;
  standard: AQIStandard;
  colorBlindMode: boolean;
}

export const HealthGuidancePanel: React.FC<HealthGuidancePanelProps> = ({
  station,
  standard,
  colorBlindMode,
}) => {
  const [activeGroup, setActiveGroup] = useState<
    'general' | 'children' | 'seniors' | 'cardiopulmonary' | 'workers'
  >('general');

  const aqi = standard === 'NAQI' ? station.aqiNAQI : station.aqiEPA;
  const category = getAQICategory(aqi, standard, colorBlindMode);
  const healthGuide = getHealthGuideline(aqi);

  const groups = [
    { id: 'general' as const, label: 'General Population', icon: Users },
    { id: 'children' as const, label: 'Children & Schools', icon: Baby },
    { id: 'seniors' as const, label: 'Older Adults', icon: UserCheck },
    { id: 'cardiopulmonary' as const, label: 'Asthma & Cardiac', icon: Activity },
    { id: 'workers' as const, label: 'Outdoor Workers & Athletes', icon: HardHat },
  ];

  const getSpecificGuidance = () => {
    switch (activeGroup) {
      case 'children':
        return {
          headline: aqi > 200 ? 'Cancel Outdoor Recess & Athletic Training' : 'Normal Outdoor Play Permitted',
          detail:
            aqi > 200
              ? 'Children breathe 50% more air per pound of body weight than adults, and their airway linings are still developing. All vigorous outdoor sports, physical education classes, and athletic practices should be shifted into HEPA-filtered indoor gyms or postponed until ventilation clears.'
              : 'Children can participate in standard playground activities. School staff should watch for students with documented asthma complaining of wheezing or shortness of breath.',
          dos: [
            'Ensure school ventilation filters (MERV-13 or higher) are operating continuously.',
            'Keep classroom windows closed during high morning traffic peaks.',
            'Keep asthma inhalers readily accessible in the school nurse office.',
          ],
        };
      case 'seniors':
        return {
          headline: aqi > 150 ? 'Minimize Exposure; Restrict Morning Walks' : 'Safe for Moderate Outdoor Strolls',
          detail:
            aqi > 150
              ? 'Fine particulate matter (PM2.5) enters systemic circulation and increases blood pressure, arterial stiffness, and cardiac arrhythmia risk in adults over 65. Avoid early morning strolls when surface inversions trap soot.'
              : 'Safe for daily walks. Seniors with chronic cardiovascular disease should remain attentive to irregular pulse or chest tightness.',
          dos: [
            'Schedule outdoor grocery trips for early afternoon when convective mixing is highest.',
            'Stay well hydrated to maintain mucosal clearance in nasal passages.',
            'Maintain indoor relative humidity between 40% and 55%.',
          ],
        };
      case 'cardiopulmonary':
        return {
          headline: aqi > 100 ? 'High Vulnerability Alert: Pre-Medication & Clean Shelter' : 'Baseline Symptom Monitoring',
          detail:
            aqi > 100
              ? 'Individuals with asthma, COPD, or coronary artery disease are at elevated risk of severe exacerbations. Ultrafine particles trigger bronchoconstriction and systemic inflammatory cascade within 60 minutes of exposure.'
              : 'Safe baseline conditions. Carry prescribed fast-acting bronchodilator as standard precaution.',
          dos: [
            'Always carry emergency rescue inhalers (e.g. Albuterol).',
            'Wear a certified N95 respirator if outdoor transit is unavoidable.',
            'Establish an airtight "clean room" equipped with a true HEPA air purifier at home.',
          ],
        };
      case 'workers':
        return {
          headline: aqi > 200 ? 'Mandatory Personal Protective Equipment (N95/FFP2)' : 'Normal Shift Operations',
          detail:
            aqi > 200
              ? 'Outdoor laborers, construction crews, and couriers have elevated minute ventilation rates (25–35 L/min), resulting in heavy alveolar toxic deposition. Employers must furnish NIOSH-certified N95 or FFP2 respirators and institute 15-minute indoor breaks every hour.'
              : 'Standard occupational protocols. Stay hydrated and avoid smoking or diesel vehicle idling zones.',
          dos: [
            'Ensure airtight mask seal across nasal bridge (facial hair breaks seal).',
            'Rotate shifts away from arterial traffic corridors during peak traffic.',
            'Never rely on cloth bandanas or surgical paper masks, which fail to filter PM2.5.',
          ],
        };
      default:
        return {
          headline: aqi > 200 ? 'Reduce Prolonged or Heavy Outdoor Exertion' : 'Good to Moderate Air Quality',
          detail: healthGuide.generalPublic,
          dos: [
            'Keep doors and windows sealed when outdoor AQI exceeds 150.',
            'Operate indoor HEPA air purifiers at 3 to 5 Air Changes per Hour (ACH).',
            'Avoid burning incense, candles, or indoor high-heat frying during poor air periods.',
          ],
        };
    }
  };

  const guidance = getSpecificGuidance();

  return (
    <section className="space-y-5" id="health-guidance-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#F3F7F8] flex items-center space-x-2">
            <HeartPulse className="h-5 w-5 text-[#4DD4DF]" />
            <span>Public Health & Clinical Advisory</span>
          </h2>
          <p className="text-xs text-[#8193A0]">
            Actionable medical and preventive precautions adapted to current AQI ({aqi} · {category.label}).
          </p>
        </div>

        <div className="flex items-center space-x-1 text-xs text-[#718591]">
          <span className="rounded bg-[rgba(180,210,220,0.06)] border border-[rgba(180,210,220,0.10)] px-2.5 py-1">
            Source: CPCB & WHO Guidelines
          </span>
        </div>
      </div>

      {/* Demographic Tabs */}
      <div className="flex overflow-x-auto space-x-1.5 pb-1 custom-scrollbar">
        {groups.map((grp) => {
          const Icon = grp.icon;
          const isActive = activeGroup === grp.id;
          return (
            <button
              key={grp.id}
              onClick={() => setActiveGroup(grp.id)}
              className={`flex items-center space-x-1.5 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#1AA7B5] text-white shadow-sm'
                  : 'border border-[rgba(180,210,220,0.12)] bg-[#131E27] text-[#8FA2AD] hover:text-[#E2E9EC] hover:border-[rgba(180,210,220,0.20)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{grp.label}</span>
            </button>
          );
        })}
      </div>

      {/* Detailed Advisory Card */}
      <div className="rounded-2xl border border-[rgba(180,210,220,0.10)] bg-[#111A22] p-5 sm:p-6 space-y-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[rgba(180,210,220,0.08)] pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#4DD4DF]">
              Target Demographic Advisory
            </span>
            <h3 className="text-lg font-bold text-[#F3F7F8] mt-0.5">{guidance.headline}</h3>
          </div>

          <div
            className="rounded-xl px-3 py-1.5 text-xs font-bold uppercase tracking-wider self-start sm:self-auto"
            style={{
              backgroundColor: `${category.color}18`,
              color: category.color,
              border: `1px solid ${category.color}40`,
            }}
          >
            {category.label}
          </div>
        </div>

        <p className="text-xs text-[#C7D3D9] leading-relaxed font-medium">
          {guidance.detail}
        </p>

        {/* Actionable Recommendations Checklist */}
        <div className="rounded-xl border border-[rgba(180,210,220,0.08)] bg-[#131E27] p-4 space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#F3F7F8]">
            Recommended Preventive Actions
          </span>
          <div className="space-y-2 text-xs text-[#C7D3D9]">
            {guidance.dos.map((d, i) => (
              <div key={i} className="flex items-start space-x-2.5">
                <CheckCircle2 className="h-4 w-4 text-[#16A34A] shrink-0 mt-0.5" />
                <span className="leading-snug">{d}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Triple Technical Matrix (Mask, Air Purifier, Exercise) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2">
          {/* Mask guidance */}
          <div className="rounded-xl border border-[rgba(180,210,220,0.08)] bg-[#131E27] p-4 space-y-2">
            <span className="text-xs font-bold text-[#4DD4DF] uppercase tracking-wider">
              1. Respiratory Protection
            </span>
            <div className="font-semibold text-[#F3F7F8] text-sm">
              {healthGuide.maskRequired.type}
            </div>
            <p className="text-[11px] text-[#8FA2AD] leading-relaxed">
              {healthGuide.maskRequired.details}
            </p>
          </div>

          {/* Indoor Air Purification */}
          <div className="rounded-xl border border-[rgba(180,210,220,0.08)] bg-[#131E27] p-4 space-y-2">
            <span className="text-xs font-bold text-[#4DD4DF] uppercase tracking-wider">
              2. Clean Room Engineering
            </span>
            <div className="font-semibold text-[#F3F7F8] text-sm">
              HEPA Filter: {healthGuide.indoorVentilation.hepaACH} ACH Target
            </div>
            <p className="text-[11px] text-[#8FA2AD] leading-relaxed">
              {healthGuide.indoorVentilation.guidance}
            </p>
          </div>

          {/* Physical Exertion */}
          <div className="rounded-xl border border-[rgba(180,210,220,0.08)] bg-[#131E27] p-4 space-y-2">
            <span className="text-xs font-bold text-[#EAB308] uppercase tracking-wider">
              3. Cardiovascular Stress
            </span>
            <div className="font-semibold text-[#F3F7F8] text-sm">
              {healthGuide.outdoorAthletics.allowed ? 'Outdoor Exercise OK' : 'Indoor Workouts Only'}
            </div>
            <p className="text-[11px] text-[#8FA2AD] leading-relaxed">
              {healthGuide.outdoorAthletics.recommendation}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
