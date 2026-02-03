import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion } from 'framer-motion';
import { AlertCircle, ExternalLink, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RefillAlerts({ medications }) {
  const lowSupplyMeds = medications.filter(med => {
    if (!med.refill_enabled || !med.current_supply || !med.refill_threshold_days) return false;
    
    let dailyDoses = 1;
    switch (med.frequency) {
      case 'twice_daily': dailyDoses = 2; break;
      case 'three_times_daily': dailyDoses = 3; break;
      case 'four_times_daily': dailyDoses = 4; break;
      case 'every_other_day': dailyDoses = 0.5; break;
      case 'weekly': dailyDoses = 1/7; break;
      case 'as_needed': return false;
    }
    
    const daysRemaining = Math.floor(med.current_supply / dailyDoses);
    return daysRemaining <= med.refill_threshold_days;
  });

  if (lowSupplyMeds.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-200 rounded-2xl p-6 mb-6">
      
      <div className="flex items-start gap-3 mb-4">
        <AlertCircle className="w-6 h-6 text-orange-600 mt-1" />
        <div>
          <h3 className="text-lg font-bold text-slate-900">Refill Reminders</h3>
          <p className="text-sm text-slate-600">
            {lowSupplyMeds.length} medication{lowSupplyMeds.length > 1 ? 's' : ''} running low
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {lowSupplyMeds.map(med => {
          let dailyDoses = 1;
          switch (med.frequency) {
            case 'twice_daily': dailyDoses = 2; break;
            case 'three_times_daily': dailyDoses = 3; break;
            case 'four_times_daily': dailyDoses = 4; break;
            case 'every_other_day': dailyDoses = 0.5; break;
            case 'weekly': dailyDoses = 1/7; break;
          }
          const daysRemaining = Math.floor(med.current_supply / dailyDoses);

          return (
            <div key={med.id} className="bg-white rounded-xl p-4 border border-orange-200">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900">{med.name}</h4>
                  <p className="text-sm text-slate-600">{med.dosage}</p>
                </div>
                <span className="text-sm font-medium text-orange-600">
                  ~{daysRemaining} days left
                </span>
              </div>
              
              <p className="text-sm text-slate-700 mb-3">
                {med.current_supply} doses remaining
              </p>

              {(med.pharmacy_name || med.pharmacy_phone) && (
                <div className="bg-slate-50 rounded-lg p-3 mb-3 text-sm">
                  {med.pharmacy_name && (
                    <p className="font-medium text-slate-900">{med.pharmacy_name}</p>
                  )}
                  {med.pharmacy_phone && (
                    <a 
                      href={`tel:${med.pharmacy_phone}`}
                      className="text-sky-600 hover:text-sky-700 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {med.pharmacy_phone}
                    </a>
                  )}
                </div>
              )}

              <Link to={createPageUrl('EditMedication') + '?id=' + med.id}>
                <Button size="sm" variant="outline" className="w-full">
                  Update Supply
                </Button>
              </Link>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}