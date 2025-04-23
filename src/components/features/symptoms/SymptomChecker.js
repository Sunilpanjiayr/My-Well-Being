// src/components/SymptomChecker.js
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, PieChart, 
  Pie, Cell, LineChart, Line
} from 'recharts';
import './SymptomChecker.css';

// Comprehensive 150+ symptoms list
// src/data/symptomsData.js

// Comprehensive 150+ symptoms list
export const symptomsData = [
  { id: 1, name: 'Headache', category: 'Neurological' },
  { id: 2, name: 'Fever', category: 'General' },
  { id: 3, name: 'Cough', category: 'Respiratory' },
  { id: 4, name: 'Sore Throat', category: 'Respiratory' },
  { id: 5, name: 'Fatigue', category: 'General' },
  { id: 6, name: 'Nausea', category: 'Digestive' },
  { id: 7, name: 'Abdominal Pain', category: 'Digestive' },
  { id: 8, name: 'Dizziness', category: 'Neurological' },
  { id: 9, name: 'Chills', category: 'General' },
  { id: 10, name: 'Joint Pain', category: 'Musculoskeletal' },
  { id: 11, name: 'Muscle Pain', category: 'Musculoskeletal' },
  { id: 12, name: 'Rash', category: 'Skin' },
  { id: 13, name: 'Itching', category: 'Skin' },
  { id: 14, name: 'Shortness of Breath', category: 'Respiratory' },
  { id: 15, name: 'Chest Pain', category: 'Cardiovascular' },
  { id: 16, name: 'Palpitations', category: 'Cardiovascular' },
  { id: 17, name: 'Diarrhea', category: 'Digestive' },
  { id: 18, name: 'Constipation', category: 'Digestive' },
  { id: 19, name: 'Vomiting', category: 'Digestive' },
  { id: 20, name: 'Loss of Appetite', category: 'General' },
  { id: 21, name: 'Weight Loss', category: 'General' },
  { id: 22, name: 'Weight Gain', category: 'General' },
  { id: 23, name: 'Night Sweats', category: 'General' },
  { id: 24, name: 'Swollen Lymph Nodes', category: 'General' },
  { id: 25, name: 'Sleeplessness', category: 'Neurological' },
  { id: 26, name: 'Excessive Sleepiness', category: 'Neurological' },
  { id: 27, name: 'Blur of Vision', category: 'Eye' },
  { id: 28, name: 'Eye Pain', category: 'Eye' },
  { id: 29, name: 'Hearing Loss', category: 'Ear' },
  { id: 30, name: 'Earache', category: 'Ear' },
  { id: 31, name: 'Tinnitus', category: 'Ear' },
  { id: 32, name: 'Nosebleed', category: 'Respiratory' },
  { id: 33, name: 'Runny Nose', category: 'Respiratory' },
  { id: 34, name: 'Sneezing', category: 'Respiratory' },
  { id: 35, name: 'Swollen Ankles', category: 'Cardiovascular' },
  { id: 36, name: 'Back Pain', category: 'Musculoskeletal' },
  { id: 37, name: 'Neck Pain', category: 'Musculoskeletal' },
  { id: 38, name: 'Shoulder Pain', category: 'Musculoskeletal' },
  { id: 39, name: 'Knee Pain', category: 'Musculoskeletal' },
  { id: 40, name: 'Dry Mouth', category: 'General' },
  { id: 41, name: 'Excessive Thirst', category: 'General' },
  { id: 42, name: 'Frequent Urination', category: 'Urinary' },
  { id: 43, name: 'Painful Urination', category: 'Urinary' },
  { id: 44, name: 'Blood in Urine', category: 'Urinary' },
  { id: 45, name: 'Loss of Smell', category: 'Neurological' },
  { id: 46, name: 'Loss of Taste', category: 'Neurological' },
  { id: 47, name: 'Mouth Ulcers', category: 'Oral' },
  { id: 48, name: 'Bad Breath', category: 'Oral' },
  { id: 49, name: 'Gum Bleeding', category: 'Oral' },
  { id: 50, name: 'Hair Loss', category: 'Skin' },
  { id: 51, name: 'Dry Skin', category: 'Skin' },
  { id: 52, name: 'Bruising Easily', category: 'Skin' },
  { id: 53, name: 'Yellowing of Skin', category: 'General' },
  { id: 54, name: 'Tremors', category: 'Neurological' },
  { id: 55, name: 'Seizures', category: 'Neurological' },
  { id: 56, name: 'Confusion', category: 'Neurological' },
  { id: 57, name: 'Memory Loss', category: 'Neurological' },
  { id: 58, name: 'Anxiety', category: 'Mental' },
  { id: 59, name: 'Depression', category: 'Mental' },
  { id: 60, name: 'Irritability', category: 'Mental' },
  { id: 61, name: 'Difficulty Concentrating', category: 'Neurological' },
  { id: 62, name: 'Chest Tightness', category: 'Respiratory' },
  { id: 63, name: 'Wheezing', category: 'Respiratory' },
  { id: 64, name: 'Hives', category: 'Skin' },
  { id: 65, name: 'Swollen Face', category: 'General' },
  { id: 66, name: 'Tongue Swelling', category: 'General' },
  { id: 67, name: 'Hoarseness', category: 'Respiratory' },
  { id: 68, name: 'Difficulty Swallowing', category: 'Digestive' },
  { id: 69, name: 'Burning Sensation in Chest', category: 'Digestive' },
  { id: 70, name: 'Fainting', category: 'Neurological' },
  { id: 71, name: 'Numbness', category: 'Neurological' },
  { id: 72, name: 'Tingling', category: 'Neurological' },
  { id: 73, name: 'Excessive Sweating', category: 'Skin' },
  { id: 74, name: 'Cold Hands or Feet', category: 'Cardiovascular' },
  { id: 75, name: 'Brittle Nails', category: 'Skin' },
  { id: 76, name: 'Muscle Cramping', category: 'Musculoskeletal' },
  { id: 77, name: 'Ankle Pain', category: 'Musculoskeletal' },
  { id: 78, name: 'Wrist Pain', category: 'Musculoskeletal' },
  { id: 79, name: 'Hip Pain', category: 'Musculoskeletal' },
  { id: 80, name: 'Stiffness', category: 'Musculoskeletal' },
  { id: 81, name: 'Swollen Joints', category: 'Musculoskeletal' },
  { id: 82, name: 'Foot Pain', category: 'Musculoskeletal' },
  { id: 83, name: 'Difficulty Walking', category: 'Musculoskeletal' },
  { id: 84, name: 'Eye Discharge', category: 'Eye' },
  { id: 85, name: 'Eye Redness', category: 'Eye' },
  { id: 86, name: 'Swollen Eyelids', category: 'Eye' },
  { id: 87, name: 'Ear Discharge', category: 'Ear' },
  { id: 88, name: 'Ear Fullness', category: 'Ear' },
  { id: 89, name: 'Itchy Ears', category: 'Ear' },
  { id: 90, name: 'Facial Pain', category: 'Neurological' },
  { id: 91, name: 'Jaw Pain', category: 'Musculoskeletal' },
  { id: 92, name: 'Bleeding Gums', category: 'Oral' },
  { id: 93, name: 'Toothache', category: 'Oral' },
  { id: 94, name: 'Frequent Coughing', category: 'Respiratory' },
  { id: 95, name: 'Coughing Blood', category: 'Respiratory' },
  { id: 96, name: 'Nasal Congestion', category: 'Respiratory' },
  { id: 97, name: 'Post-Nasal Drip', category: 'Respiratory' },
  { id: 98, name: 'Increased Heart Rate', category: 'Cardiovascular' },
  { id: 99, name: 'Sexual Dysfunction', category: 'General' },
  { id: 100, name: 'Irregular Periods', category: 'Reproductive' },
  { id: 101, name: 'Breast Pain', category: 'Reproductive' },
  { id: 102, name: 'Menstrual Cramps', category: 'Reproductive' },
  { id: 103, name: 'Vaginal Discharge', category: 'Reproductive' },
  { id: 104, name: 'Vaginal Itching', category: 'Reproductive' },
  { id: 105, name: 'Testicular Pain', category: 'Reproductive' },
  { id: 106, name: 'Blood in Stool', category: 'Digestive' },
  { id: 107, name: 'Heartburn', category: 'Digestive' },
  { id: 108, name: 'Bloating', category: 'Digestive' },
  { id: 109, name: 'Flatulence', category: 'Digestive' },
  { id: 110, name: 'Incontinence', category: 'Urinary' },
  { id: 111, name: 'Low Back Pain', category: 'Musculoskeletal' },
  { id: 112, name: 'Swollen Glands', category: 'General' },
  { id: 113, name: 'Skin Ulcers', category: 'Skin' },
  { id: 114, name: 'Genital Sores', category: 'Reproductive' },
  { id: 115, name: 'Excessive Gas', category: 'Digestive' },
  { id: 116, name: 'Indigestion', category: 'Digestive' },
  { id: 117, name: 'Reduced Appetite', category: 'Digestive' },
  { id: 118, name: 'Difficulty Breathing', category: 'Respiratory' },
  { id: 119, name: 'Shortness of Breath at Night', category: 'Respiratory' },
  { id: 120, name: 'Dizziness When Standing', category: 'Cardiovascular' },
  { id: 121, name: 'Leg Pain', category: 'Musculoskeletal' },
  { id: 122, name: 'Mood Swings', category: 'Mental' },
  { id: 123, name: 'Panic Attacks', category: 'Mental' },
  { id: 124, name: 'Obsessive Thoughts', category: 'Mental' },
  { id: 125, name: 'Racing Thoughts', category: 'Mental' },
  { id: 126, name: 'Excessive Worry', category: 'Mental' },
  { id: 127, name: 'Hallucinations', category: 'Mental' },
  { id: 128, name: 'Blood Pressure Changes', category: 'Cardiovascular' },
  { id: 129, name: 'Abnormal Heart Rhythm', category: 'Cardiovascular' },
  { id: 130, name: 'Varicose Veins', category: 'Cardiovascular' },
  { id: 131, name: 'Leg Swelling', category: 'Cardiovascular' },
  { id: 132, name: 'Intolerance to Cold', category: 'General' },
  { id: 133, name: 'Intolerance to Heat', category: 'General' },
  { id: 134, name: 'Unintended Weight Change', category: 'General' },
  { id: 135, name: 'Excessive Hunger', category: 'General' },
  { id: 136, name: 'Acid Reflux', category: 'Digestive' },
  { id: 137, name: 'Stomach Cramps', category: 'Digestive' },
  { id: 138, name: 'Rectal Bleeding', category: 'Digestive' },
  { id: 139, name: 'Black Stool', category: 'Digestive' },
  { id: 140, name: 'Pale Stool', category: 'Digestive' },
  { id: 141, name: 'Greasy Stool', category: 'Digestive' },
  { id: 142, name: 'Bloody Mucus in Stool', category: 'Digestive' },
  { id: 143, name: 'Urinary Urgency', category: 'Urinary' },
  { id: 144, name: 'Urinary Frequency', category: 'Urinary' },
  { id: 145, name: 'Urinary Hesitancy', category: 'Urinary' },
  { id: 146, name: 'Decreased Urine Output', category: 'Urinary' },
  { id: 147, name: 'Dark Urine', category: 'Urinary' },
  { id: 148, name: 'Cloudy Urine', category: 'Urinary' },
  { id: 149, name: 'Foamy Urine', category: 'Urinary' },
  { id: 150, name: 'Foul-Smelling Urine', category: 'Urinary' },
  { id: 151, name: 'Bedwetting', category: 'Urinary' },
  { id: 152, name: 'Double Vision', category: 'Eye' },
  { id: 153, name: 'Night Blindness', category: 'Eye' },
  { id: 154, name: 'Sensitivity to Light', category: 'Eye' },
  { id: 155, name: 'Floaters in Vision', category: 'Eye' },
  { id: 156, name: 'Flashes of Light', category: 'Eye' },
  { id: 157, name: 'Dry Eyes', category: 'Eye' },
  { id: 158, name: 'Eye Strain', category: 'Eye' },
  { id: 159, name: 'Loss of Balance', category: 'Neurological' },
  { id: 160, name: 'Loss of Coordination', category: 'Neurological' }
];

// Symptom categories for filtering
export const symptomCategories = [
  { id: 'all', name: 'All Categories' },
  { id: 'General', name: 'General' },
  { id: 'Neurological', name: 'Neurological' },
  { id: 'Respiratory', name: 'Respiratory' },
  { id: 'Cardiovascular', name: 'Cardiovascular' },
  { id: 'Digestive', name: 'Digestive' },
  { id: 'Musculoskeletal', name: 'Musculoskeletal' },
  { id: 'Skin', name: 'Skin' },
  { id: 'Eye', name: 'Eye' },
  { id: 'Ear', name: 'Ear' },
  { id: 'Oral', name: 'Oral' },
  { id: 'Urinary', name: 'Urinary' },
  { id: 'Mental', name: 'Mental Health' },
  { id: 'Reproductive', name: 'Reproductive' }
];

// Condition mappings with solutions
// src/data/conditionMappings.js

// Condition mappings with solutions
export const conditionMappings = {

  Headache: [
    {
      condition: 'Tension Headache',
      probability: 'Common',
      solution: 'Rest in a quiet, dark room. Apply a warm or cool compress to forehead. Consider over-the-counter pain relievers like ibuprofen or acetaminophen.',
      urgency: 'Low'
    },
    {
      condition: 'Migraine',
      probability: 'Possible',
      solution: 'Identify and avoid triggers (e.g., stress, certain foods). Stay hydrated. Try prescribed antimigraine medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sinusitis',
      probability: 'Possible',
      solution: 'Use saline nasal spray, apply warm compresses to sinuses, consider decongestants.',
      urgency: 'Low'
    },
    {
      condition: 'Cluster Headache',
      probability: 'Rare',
      solution: 'Seek immediate medical help. Oxygen therapy may help. Avoid alcohol during episodes.',
      urgency: 'High'
    }
  ],
  
  Dizziness: [
    {
      condition: 'Gastroenteritis',
      probability: 'Very Common',
      solution: 'Stay hydrated with water, broth, or electrolyte solutions. Follow BRAT diet (bananas, rice, applesauce, toast).',
      urgency: 'Moderate'
    },
    {
      condition: 'Food Poisoning',
      probability: 'Common',
      solution: 'Stay hydrated, rest, seek medical attention if symptoms are severe or last more than 2 days.',
      urgency: 'Moderate'
    },
    {
      condition: 'Irritable Bowel Syndrome',
      probability: 'Common',
      solution: 'Identify and avoid trigger foods, stress management, fiber supplements, probiotics.',
      urgency: 'Low'
    },
    {
      condition: 'Inflammatory Bowel Disease',
      probability: 'Less Common',
      solution: 'Anti-inflammatory medications, immunosuppressants, dietary changes, regular medical care.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Possible',
      solution: 'Discuss with doctor, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    }
   
  ],
  
  Sleeplessness: [
    {
      condition: 'Insomnia',
      probability: 'Common',
      solution: 'Improve sleep hygiene, maintain regular sleep schedule, limit screen time before bed, consider relaxation techniques or cognitive behavioral therapy.',
      urgency: 'Low'
    },
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Stress management techniques, mindfulness practices, possibly counseling or therapy if persistent.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sleep Apnea',
      probability: 'Possible',
      solution: 'Sleep study for diagnosis, CPAP device if prescribed, weight management, sleeping position changes.',
      urgency: 'Moderate'
    },
    {
      condition: 'Restless Leg Syndrome',
      probability: 'Possible',
      solution: 'Regular exercise, avoid caffeine and alcohol, iron supplements if deficient, prescribed medications if severe.',
      urgency: 'Low'
    }
  ],
  
  'Excessive Sleepiness': [
    {
      condition: 'Sleep Deprivation',
      probability: 'Common',
      solution: 'Establish consistent sleep schedule, ensure adequate sleep duration (7-9 hours), improve sleep environment.',
      urgency: 'Low'
    },
    {
      condition: 'Sleep Apnea',
      probability: 'Common',
      solution: 'Sleep study for diagnosis, CPAP therapy if prescribed, weight management, avoid alcohol before sleep.',
      urgency: 'Moderate'
    },
    {
      condition: 'Narcolepsy',
      probability: 'Rare',
      solution: 'Seek neurological evaluation, medications like stimulants or sodium oxybate may be prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Depression',
      probability: 'Possible',
      solution: 'Mental health evaluation, therapy, potentially antidepressant medication, regular exercise.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hypothyroidism',
      probability: 'Possible',
      solution: 'Thyroid function tests, thyroid hormone replacement therapy if diagnosed.',
      urgency: 'Moderate'
    }
  ],
  
  'Loss of Smell': [
    {
      condition: 'Upper Respiratory Infection',
      probability: 'Common',
      solution: 'Time and rest are usually sufficient, nasal saline irrigation may help.',
      urgency: 'Low'
    },
    {
      condition: 'COVID-19',
      probability: 'Possible',
      solution: 'Get tested, follow isolation guidelines if positive, most recover smell within weeks to months.',
      urgency: 'Moderate'
    },
    {
      condition: 'Nasal Polyps',
      probability: 'Possible',
      solution: 'Corticosteroid nasal sprays, possible surgery for removal if severe.',
      urgency: 'Low'
    },
    {
      condition: 'Traumatic Brain Injury',
      probability: 'Less Common',
      solution: 'Medical evaluation, olfactory training may help recovery.',
      urgency: 'Moderate'
    }
  ],
  
  'Loss of Taste': [
    {
      condition: 'Upper Respiratory Infection',
      probability: 'Common',
      solution: 'Usually resolves with time and rest, maintain oral hygiene.',
      urgency: 'Low'
    },
    {
      condition: 'COVID-19',
      probability: 'Possible',
      solution: 'Get tested, follow isolation guidelines if positive, most recover taste within weeks to months.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Possible',
      solution: 'Consult doctor, do not stop prescribed medications without medical advice.',
      urgency: 'Low'
    },
    {
      condition: 'Zinc Deficiency',
      probability: 'Possible',
      solution: 'Zinc supplements, dietary changes to include zinc-rich foods.',
      urgency: 'Low'
    }
  ],
  
  Tremors: [
    {
      condition: 'Essential Tremor',
      probability: 'Common',
      solution: 'Avoid caffeine, stress management, beta blockers or anti-seizure medications if prescribed.',
      urgency: 'Low'
    },
    {
      condition: 'Parkinsons Disease',
      probability: 'Possible',
      solution: 'Neurological evaluation, prescribed medications, physical therapy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical evaluation, possible adjustment of medications under doctors supervision.',
      urgency: 'Moderate'
    },
    {
      condition: 'Alcohol Withdrawal',
      probability: 'Possible',
      solution: 'Medical supervision for detox, possibly prescribed medications, support groups.',
      urgency: 'High'
    },
    {
      condition: 'Hyperthyroidism',
      probability: 'Possible',
      solution: 'Thyroid function tests, antithyroid medications if diagnosed.',
      urgency: 'Moderate'
    }
  ],
  
  Seizures: [
    {
      condition: 'Epilepsy',
      probability: 'Common',
      solution: 'Anticonvulsant medications, avoid triggers, regular medical follow-up.',
      urgency: 'High'
    },
    {
      condition: 'Low Blood Sugar',
      probability: 'Possible',
      solution: 'Consume fast-acting carbohydrates if conscious, glucagon injection if unconscious (by trained person).',
      urgency: 'Critical'
    },
    {
      condition: 'Alcohol Withdrawal',
      probability: 'Possible',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY for seizures from alcohol withdrawal.',
      urgency: 'Critical'
    },
    {
      condition: 'Brain Injury/Tumor',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE for new-onset seizures for proper evaluation and treatment.',
      urgency: 'Critical'
    }
  ],
  
  Confusion: [
    {
      condition: 'Dehydration',
      probability: 'Common',
      solution: 'Oral rehydration, IV fluids if severe, seek medical attention if persistent.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Urinary Tract Infection (in elderly)',
      probability: 'Common',
      solution: 'Antibiotics, increased fluid intake, seek medical attention promptly.',
      urgency: 'High'
    },
    {
      condition: 'Low Blood Sugar',
      probability: 'Possible',
      solution: 'Consume fast-acting carbohydrates if able, seek medical help if severe.',
      urgency: 'High'
    },
    {
      condition: 'Stroke',
      probability: 'Possible',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY for sudden confusion, especially with other symptoms.',
      urgency: 'Critical'
    },
    {
      condition: 'Dementia',
      probability: 'Possible (especially in elderly)',
      solution: 'Medical evaluation, support services, memory care strategies, medications may help symptoms.',
      urgency: 'Moderate'
    }
  ],
  
  'Memory Loss': [
    {
      condition: 'Normal Aging',
      probability: 'Common',
      solution: 'Mental stimulation, physical exercise, social engagement, memory techniques.',
      urgency: 'Low'
    },
    {
      condition: 'Alzheimers Disease',
      probability: 'Possible (especially in elderly)',
      solution: 'Medical evaluation, prescribed medications may slow progression, support services.',
      urgency: 'Moderate'
    },
    {
      condition: 'Vitamin B12 Deficiency',
      probability: 'Possible',
      solution: 'Blood tests, B12 supplements or injections if deficient.',
      urgency: 'Moderate'
    },
    {
      condition: 'Thyroid Disorders',
      probability: 'Possible',
      solution: 'Thyroid function tests, appropriate medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Depression',
      probability: 'Common',
      solution: 'Mental health evaluation, therapy, possibly antidepressants, lifestyle changes.',
      urgency: 'Moderate'
    }
  ],
  
  'Difficulty Concentrating': [
    {
      condition: 'ADHD',
      probability: 'Possible',
      solution: 'Professional evaluation, behavioral strategies, possibly medication, organizational techniques.',
      urgency: 'Low'
    },
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Stress management techniques, therapy, possibly medication, regular exercise.',
      urgency: 'Moderate'
    },
    {
      condition: 'Depression',
      probability: 'Common',
      solution: 'Mental health support, therapy, potentially antidepressants, lifestyle changes.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sleep Deprivation',
      probability: 'Common',
      solution: 'Improve sleep hygiene, establish regular sleep schedule, address underlying sleep disorders.',
      urgency: 'Low'
    },
    {
      condition: 'Thyroid Disorders',
      probability: 'Possible',
      solution: 'Thyroid function tests, appropriate treatment if diagnosed.',
      urgency: 'Moderate'
    }
  ],
  
  Fainting: [
    {
      condition: 'Vasovagal Syncope',
      probability: 'Common',
      solution: 'Lie down with legs elevated when feeling faint, avoid triggers, stay hydrated.',
      urgency: 'Moderate'
    },
    {
      condition: 'Orthostatic Hypotension',
      probability: 'Common',
      solution: 'Rise slowly from sitting/lying, stay hydrated, consider compression stockings.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cardiac Arrhythmia',
      probability: 'Possible',
      solution: 'SEEK MEDICAL EVALUATION, especially for recurrent episodes.',
      urgency: 'High'
    },
    {
      condition: 'Dehydration',
      probability: 'Common',
      solution: 'Increase fluid intake, electrolyte beverages, seek medical attention if severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anemia',
      probability: 'Possible',
      solution: 'Blood tests, iron or vitamin supplements as directed, dietary changes.',
      urgency: 'Moderate'
    }
  ],
  
  Numbness: [
    {
      condition: 'Peripheral Neuropathy',
      probability: 'Possible',
      solution: 'Treat underlying cause, medications for nerve pain, physical therapy, regular foot care.',
      urgency: 'Moderate'
    },
    {
      condition: 'Vitamin B12 Deficiency',
      probability: 'Possible',
      solution: 'B12 supplements or injections, dietary changes, treat underlying absorption issues.',
      urgency: 'Moderate'
    },
    {
      condition: 'Multiple Sclerosis',
      probability: 'Less Common',
      solution: 'Disease-modifying therapies, symptom management, physical therapy, occupational therapy.',
      urgency: 'High'
    },
    {
      condition: 'Carpal Tunnel Syndrome',
      probability: 'Common',
      solution: 'Wrist splints, ergonomic adjustments, anti-inflammatory medications, possible surgery.',
      urgency: 'Low'
    },
    {
      condition: 'Stroke',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY if sudden numbness, especially on one side of body.',
      urgency: 'Critical'
    }
  
  ],
  
  Tingling: [
    {
      condition: 'Peripheral Neuropathy',
      probability: 'Common',
      solution: 'Treat underlying cause, medications for nerve pain, physical therapy, blood sugar control if diabetic.',
      urgency: 'Moderate'
    },
    {
      condition: 'Vitamin B12 Deficiency',
      probability: 'Possible',
      solution: 'B12 supplements or injections, dietary changes to include B12-rich foods.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pinched Nerve',
      probability: 'Common',
      solution: 'Rest affected area, physical therapy, anti-inflammatory medication, possibly surgery if severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Multiple Sclerosis',
      probability: 'Less Common',
      solution: 'Neurological evaluation, MRI for diagnosis, disease-modifying therapies if diagnosed.',
      urgency: 'High'
    },
    {
      condition: 'Stroke',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY for sudden tingling, especially on one side of body.',
      urgency: 'Critical'
    }
  ],
  
  'Facial Pain': [
    {
      condition: 'Trigeminal Neuralgia',
      probability: 'Possible',
      solution: 'Anticonvulsant medications, pain management, possible surgical procedures if refractory.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sinusitis',
      probability: 'Common',
      solution: 'Nasal decongestants, saline nasal spray, warm compresses, antibiotics if bacterial.',
      urgency: 'Low'
    },
    {
      condition: 'Temporomandibular Joint Disorder (TMJ)',
      probability: 'Common',
      solution: 'Jaw exercises, warm compresses, soft diet, night guard, stress management.',
      urgency: 'Low'
    },
    {
      condition: 'Dental Problems',
      probability: 'Common',
      solution: 'Dental evaluation, appropriate treatment based on diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cluster Headache',
      probability: 'Less Common',
      solution: 'Oxygen therapy, triptans, preventive medications, avoid alcohol during clusters.',
      urgency: 'High'
    }
  ],
  
  'Loss of Balance': [
    {
      condition: 'Inner Ear Problems',
      probability: 'Common',
      solution: 'Vestibular rehabilitation exercises, medications for vertigo, stay hydrated.',
      urgency: 'Moderate'
    },
    {
      condition: 'Benign Paroxysmal Positional Vertigo',
      probability: 'Common',
      solution: 'Epley maneuver or other repositioning exercises, vestibular rehabilitation.',
      urgency: 'Low'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Stroke',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY for sudden balance problems, especially with other symptoms.',
      urgency: 'Critical'
    },
    {
      condition: 'Multiple Sclerosis',
      probability: 'Less Common',
      solution: 'Neurological evaluation, MRI for diagnosis, disease-modifying therapies if diagnosed.',
      urgency: 'High'
    },
    {
      condition: 'Parkinsons Disease',
      probability: 'Possible',
      solution: 'Neurological evaluation, physical therapy, prescribed medications.',
      urgency: 'Moderate'
    }
  ],
  
  'Loss of Coordination': [
    {
      condition: 'Multiple Sclerosis',
      probability: 'Possible',
      solution: 'Neurological evaluation, MRI for diagnosis, disease-modifying therapies if diagnosed.',
      urgency: 'High'
    },
    {
      condition: 'Stroke',
      probability: 'Possible',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY for sudden coordination loss.',
      urgency: 'Critical'
    },
    {
      condition: 'Parkinsons Disease',
      probability: 'Possible',
      solution: 'Neurological evaluation, physical therapy, prescribed medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cerebellar Disorders',
      probability: 'Less Common',
      solution: 'Neurological evaluation, physical and occupational therapy, treat underlying cause if possible.',
      urgency: 'High'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Alcohol Intoxication',
      probability: 'Possible',
      solution: 'Stop alcohol consumption, ensure safety, seek help for alcohol use disorder if needed.',
      urgency: 'Moderate'
    }
  ],
  
  // MENTAL SYMPTOMS
  Anxiety: [
    {
      condition: 'Generalized Anxiety Disorder',
      probability: 'Common',
      solution: 'Cognitive behavioral therapy, relaxation techniques, sometimes medication, regular exercise.',
      urgency: 'Moderate'
    },
    {
      condition: 'Panic Disorder',
      probability: 'Possible',
      solution: 'Cognitive behavioral therapy, exposure therapy, breathing exercises, possible medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'Social Anxiety Disorder',
      probability: 'Common',
      solution: 'Cognitive behavioral therapy, gradual exposure to social situations, support groups.',
      urgency: 'Moderate'
    },
    {
      condition: 'Post-Traumatic Stress Disorder',
      probability: 'Possible',
      solution: 'Trauma-focused therapy, medication, support groups, stress management techniques.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Thyroid Disorders',
      probability: 'Possible',
      solution: 'Medical evaluation, thyroid function tests, appropriate treatment for thyroid condition.',
      urgency: 'Moderate'
    }
  ],
  
  Depression: [
    {
      condition: 'Major Depressive Disorder',
      probability: 'Common',
      solution: 'Professional mental health treatment, therapy, possibly medication, regular exercise.',
      urgency: 'Moderate'
    },
    {
      condition: 'Seasonal Affective Disorder',
      probability: 'Possible',
      solution: 'Light therapy, vitamin D supplements, regular outdoor activity, professional treatment.',
      urgency: 'Moderate'
    },
    {
      condition: 'Bipolar Disorder',
      probability: 'Possible',
      solution: 'Professional psychiatric care, mood stabilizers, therapy, regular sleep schedule.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Adjustment Disorder',
      probability: 'Common',
      solution: 'Therapy, social support, stress management techniques, temporary medication if needed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Vitamin D Deficiency',
      probability: 'Possible',
      solution: 'Vitamin D supplements, increased sun exposure, dietary changes, blood test to confirm.',
      urgency: 'Low'
    }
  ],
  
  Irritability: [
    {
      condition: 'Stress',
      probability: 'Very Common',
      solution: 'Stress management techniques, regular exercise, adequate sleep, mindfulness practices.',
      urgency: 'Low'
    },
    {
      condition: 'Depression',
      probability: 'Common',
      solution: 'Mental health evaluation, therapy, potentially medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anxiety Disorders',
      probability: 'Common',
      solution: 'Cognitive behavioral therapy, stress management, possibly medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'Bipolar Disorder',
      probability: 'Possible',
      solution: 'Psychiatric evaluation, mood stabilizers, therapy, regular sleep schedule.',
      urgency: 'High'
    },
    {
      condition: 'Thyroid Disorders',
      probability: 'Possible',
      solution: 'Thyroid function tests, appropriate medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Possible',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    }
  ],
  
  'Mood Swings': [
    {
      condition: 'Bipolar Disorder',
      probability: 'Possible',
      solution: 'Psychiatric evaluation, mood stabilizers, therapy, regular sleep schedule.',
      urgency: 'High'
    },
    {
      condition: 'Premenstrual Syndrome',
      probability: 'Common (in women)',
      solution: 'Regular exercise, dietary changes, over-the-counter pain relievers, stress management.',
      urgency: 'Low'
    },
    {
      condition: 'Borderline Personality Disorder',
      probability: 'Possible',
      solution: 'Dialectical behavior therapy, schema therapy, possibly medication for specific symptoms.',
      urgency: 'Moderate'
    },
    {
      condition: 'Thyroid Disorders',
      probability: 'Possible',
      solution: 'Thyroid function tests, appropriate medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Possible',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Substance Use',
      probability: 'Possible',
      solution: 'Substance use evaluation, appropriate treatment plan, support groups.',
      urgency: 'Moderate'
    }
  ],
  
  'Panic Attacks': [
    {
      condition: 'Panic Disorder',
      probability: 'Common',
      solution: 'Cognitive behavioral therapy, breathing exercises, possibly medication, regular exercise.',
      urgency: 'Moderate'
    },
    {
      condition: 'Generalized Anxiety Disorder',
      probability: 'Common',
      solution: 'Cognitive behavioral therapy, relaxation techniques, possibly medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'Post-Traumatic Stress Disorder',
      probability: 'Possible',
      solution: 'Trauma-focused therapy, medication if needed, support groups.',
      urgency: 'Moderate'
    },
    {
      condition: 'Thyroid Disorders',
      probability: 'Possible',
      solution: 'Thyroid function tests, appropriate medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Stimulant Use',
      probability: 'Possible',
      solution: 'Reduce or eliminate caffeine, evaluate other substance use, consider gradual cessation.',
      urgency: 'Moderate'
    }
  ],
  
  'Obsessive Thoughts': [
    {
      condition: 'Obsessive-Compulsive Disorder',
      probability: 'Common',
      solution: 'Exposure and response prevention therapy, cognitive behavioral therapy, possibly SSRIs.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anxiety Disorders',
      probability: 'Common',
      solution: 'Cognitive behavioral therapy, mindfulness practices, possibly medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'Depression',
      probability: 'Possible',
      solution: 'Mental health evaluation, therapy, potentially antidepressants if appropriate.',
      urgency: 'Moderate'
    },
    {
      condition: 'Post-Traumatic Stress Disorder',
      probability: 'Possible',
      solution: 'Trauma-focused therapy, medication if needed, support groups.',
      urgency: 'Moderate'
    }
  ],
  
  'Racing Thoughts': [
    {
      condition: 'Anxiety Disorders',
      probability: 'Common',
      solution: 'Cognitive behavioral therapy, mindfulness practices, grounding techniques, possibly medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'Bipolar Disorder (Manic Phase)',
      probability: 'Possible',
      solution: 'Psychiatric evaluation, mood stabilizers, therapy, regular sleep schedule.',
      urgency: 'High'
    },
    {
      condition: 'ADHD',
      probability: 'Possible',
      solution: 'Professional evaluation, behavioral strategies, possibly medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'Stimulant Use',
      probability: 'Possible',
      solution: 'Reduce or eliminate caffeine, evaluate other substance use, consider gradual cessation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sleep Deprivation',
      probability: 'Common',
      solution: 'Improve sleep hygiene, establish regular sleep schedule, address underlying sleep disorders.',
      urgency: 'Moderate'
    }
  ],
  
  'Excessive Worry': [
    {
      condition: 'Generalized Anxiety Disorder',
      probability: 'Common',
      solution: 'Cognitive behavioral therapy, relaxation techniques, possibly medication, regular exercise.',
      urgency: 'Moderate'
    },
    {
      condition: 'Social Anxiety Disorder',
      probability: 'Possible',
      solution: 'Cognitive behavioral therapy, exposure therapy, possibly medication if severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Obsessive-Compulsive Disorder',
      probability: 'Possible',
      solution: 'Exposure and response prevention therapy, cognitive behavioral therapy, possibly SSRIs.',
      urgency: 'Moderate'
    },
    {
      condition: 'Health Anxiety',
      probability: 'Possible',
      solution: 'Cognitive behavioral therapy, mindfulness, limiting health information seeking.',
      urgency: 'Moderate'
    },
    {
      condition: 'Adjustment Disorder',
      probability: 'Common',
      solution: 'Therapy, social support, stress management techniques, temporary medication if needed.',
      urgency: 'Moderate'
    }
  ],
  
  Hallucinations: [
    {
      condition: 'Schizophrenia',
      probability: 'Possible',
      solution: 'Psychiatric evaluation, antipsychotic medications, therapy, support services.',
      urgency: 'High'
    },
    {
      condition: 'Bipolar Disorder (Severe)',
      probability: 'Possible',
      solution: 'Psychiatric evaluation, mood stabilizers, antipsychotics if needed, therapy.',
      urgency: 'High'
    },
    {
      condition: 'Substance Use/Withdrawal',
      probability: 'Common',
      solution: 'Medical detoxification if needed, substance abuse treatment, support groups.',
      urgency: 'High'
    },
    {
      condition: 'Sleep Deprivation',
      probability: 'Possible',
      solution: 'Restore normal sleep patterns, treat underlying sleep disorders.',
      urgency: 'Moderate'
    },
    {
      condition: 'Delirium',
      probability: 'Possible (especially in hospitalized/elderly)',
      solution: 'SEEK MEDICAL ATTENTION, identify and treat underlying cause.',
      urgency: 'Critical'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Possible',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'High'
    }
  ],
  
  // GENERAL SYMPTOMS
  Fever: [
    {
      condition: 'Viral Infection',
      probability: 'Common',
      solution: 'Rest, stay hydrated with water or electrolyte drinks. Use a cool cloth on forehead. Consider acetaminophen or ibuprofen to reduce fever.',
      urgency: 'Moderate'
    },
    {
      condition: 'Bacterial Infection',
      probability: 'Possible',
      solution: 'Consult doctor for possible antibiotic treatment. Rest and hydration are essential.',
      urgency: 'Moderate'
    },
    {
      condition: 'COVID-19',
      probability: 'Possible',
      solution: 'Get tested, self-isolate, monitor symptoms, seek medical attention if breathing becomes difficult.',
      urgency: 'High'
    },
    {
      condition: 'Malaria',
      probability: 'Less Common',
      solution: 'Seek immediate medical attention for diagnosis and treatment, especially if you have been in an endemic area.',
      urgency: 'High'
    },
    {
      condition: 'Dengue Fever',
      probability: 'Less Common',
      solution: 'Get medical attention, stay hydrated, avoid aspirin and NSAIDs which may worsen bleeding.',
      urgency: 'High'
    }
  ],
  
  Fatigue: [
    {
      condition: 'Viral Infection',
      probability: 'Common',
      solution: 'Rest adequately, maintain hydration, eat nutritious foods, avoid overexertion.',
      urgency: 'Low'
    },
    {
      condition: 'Anemia',
      probability: 'Possible',
      solution: 'Diet with iron-rich foods, possible supplements. Consult doctor for proper diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Chronic Fatigue Syndrome',
      probability: 'Less Common',
      solution: 'Pacing activities, stress management, good sleep hygiene. Consult specialist.',
      urgency: 'Moderate'
    },
    {
      condition: 'Depression',
      probability: 'Possible',
      solution: 'Seek professional mental health support, consider physical activity, maintain social connections.',
      urgency: 'Moderate'
    },
    {
      condition: 'Thyroid Disorders',
      probability: 'Possible',
      solution: 'Blood tests for diagnosis, medication to regulate thyroid levels, regular follow-ups.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sleep Apnea',
      probability: 'Possible',
      solution: 'Sleep study for diagnosis, CPAP therapy, weight management, positional therapy.',
      urgency: 'Moderate'
    }

  ],
  
  Chills: [
    {
      condition: 'Viral Infection',
      probability: 'Common',
      solution: 'Rest, stay warm, drink plenty of fluids, consider fever reducers like acetaminophen.',
      urgency: 'Moderate'
    },
    {
      condition: 'Bacterial Infection',
      probability: 'Possible',
      solution: 'Medical evaluation, possibly antibiotics, rest and hydration.',
      urgency: 'Moderate'
    },
    {
      condition: 'COVID-19',
      probability: 'Possible',
      solution: 'Get tested, self-isolate, monitor symptoms, contact healthcare provider for guidance.',
      urgency: 'High'
    },
    {
      condition: 'Influenza',
      probability: 'Common (seasonal)',
      solution: 'Rest, fluids, over-the-counter fever reducers, antiviral medication if within 48 hours.',
      urgency: 'Moderate'
    },
    {
      condition: 'Urinary Tract Infection',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotics if prescribed, increased fluid intake.',
      urgency: 'Moderate'
    }
  ],
  
  'Loss of Appetite': [
    {
      condition: 'Viral Infection',
      probability: 'Common',
      solution: 'Small, frequent, nutrient-dense meals, adequate hydration, rest.',
      urgency: 'Low'
    },
    {
      condition: 'Depression',
      probability: 'Common',
      solution: 'Mental health support, cognitive behavioral therapy, possibly medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Discuss with doctor, do not stop prescribed medications without consultation.',
      urgency: 'Low to Moderate'
    },
    {
      condition: 'Digestive Disorders',
      probability: 'Possible',
      solution: 'Medical evaluation, treatment of underlying condition, dietary modifications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cancer',
      probability: 'Less Common',
      solution: 'Medical evaluation if prolonged or accompanied by weight loss and other symptoms.',
      urgency: 'High'
    }
  ],
  
  'Weight Loss': [
    {
      condition: 'Depression',
      probability: 'Common',
      solution: 'Mental health evaluation, therapy, potentially medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hyperthyroidism',
      probability: 'Possible',
      solution: 'Thyroid function tests, antithyroid medications, radioactive iodine, or surgery if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Diabetes',
      probability: 'Possible',
      solution: 'Blood glucose testing, appropriate diet, exercise, and medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Inflammatory Bowel Disease',
      probability: 'Possible',
      solution: 'Gastroenterologist evaluation, anti-inflammatory medications, dietary modifications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cancer',
      probability: 'Less Common',
      solution: 'Medical evaluation for unexplained significant weight loss.',
      urgency: 'High'
    },
    {
      condition: 'Malabsorption Disorders',
      probability: 'Possible',
      solution: 'Gastroenterologist evaluation, specific testing, dietary modifications based on diagnosis.',
      urgency: 'Moderate'
    }
  ],
  
  'Weight Gain': [
    {
      condition: 'Hypothyroidism',
      probability: 'Common',
      solution: 'Thyroid function tests, thyroid hormone replacement therapy if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    },
    {
      condition: 'Polycystic Ovary Syndrome',
      probability: 'Common (in women)',
      solution: 'Hormonal evaluation, lifestyle modifications, potentially medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cushings Syndrome',
      probability: 'Rare',
      solution: 'Endocrinology evaluation, treatment depends on cause (medication, surgery, radiation).',
      urgency: 'Moderate'
    },
    {
      condition: 'Depression',
      probability: 'Common',
      solution: 'Mental health evaluation, therapy, potentially medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Lifestyle Factors',
      probability: 'Very Common',
      solution: 'Balanced diet, regular physical activity, sufficient sleep, stress management.',
      urgency: 'Low'
    }
  ],
  
  'Night Sweats': [
    {
      condition: 'Menopause',
      probability: 'Common (in middle-aged women)',
      solution: 'Hormone replacement therapy if appropriate, moisture-wicking sleepwear, keep bedroom cool.',
      urgency: 'Low'
    },
    {
      condition: 'Infection',
      probability: 'Possible',
      solution: 'Medical evaluation to identify infection, appropriate treatment based on cause.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    },
    {
      condition: 'Anxiety Disorders',
      probability: 'Common',
      solution: 'Stress management, cognitive behavioral therapy, potentially medication.',
      urgency: 'Low'
    },
    {
      condition: 'Lymphoma',
      probability: 'Less Common',
      solution: 'Medical evaluation for persistent night sweats, especially with unexplained weight loss.',
      urgency: 'High'
    },
    {
      condition: 'Tuberculosis',
      probability: 'Less Common',
      solution: 'Medical evaluation, TB testing, appropriate antibiotic treatment if positive.',
      urgency: 'High'
    }
  ],
  
  'Swollen Lymph Nodes': [
    {
      condition: 'Infection (Bacterial/Viral)',
      probability: 'Common',
      solution: 'Treat underlying infection, rest, appropriate antibiotics if bacterial.',
      urgency: 'Moderate'
    },
    {
      condition: 'Mononucleosis',
      probability: 'Possible (especially in young adults)',
      solution: 'Rest, hydration, over-the-counter pain relievers for comfort, avoid contact sports.',
      urgency: 'Moderate'
    },
    {
      condition: 'Strep Throat',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotic treatment if diagnosed, rest and hydration.',
      urgency: 'Moderate'
    },
    {
      condition: 'HIV Infection',
      probability: 'Possible',
      solution: 'HIV testing, medical care if positive.',
      urgency: 'High'
    },
    {
      condition: 'Lymphoma',
      probability: 'Less Common',
      solution: 'Medical evaluation for persistent, painless, enlarged lymph nodes.',
      urgency: 'High'
    },
    {
      condition: 'Autoimmune Disorders',
      probability: 'Possible',
      solution: 'Medical evaluation, appropriate treatment based on specific diagnosis.',
      urgency: 'Moderate'
    }
  ],
  
  'Dry Mouth': [
    {
      condition: 'Dehydration',
      probability: 'Common',
      solution: 'Increase fluid intake, electrolyte beverages if needed, avoid caffeine and alcohol.',
      urgency: 'Low'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    },
    {
      condition: 'Sjögrens Syndrome',
      probability: 'Less Common',
      solution: 'Rheumatologist evaluation, artificial saliva products, good dental hygiene.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Stress management techniques, addressing underlying anxiety.',
      urgency: 'Low'
    },
    {
      condition: 'Diabetes',
      probability: 'Possible',
      solution: 'Blood glucose testing, appropriate management if diagnosed.',
      urgency: 'Moderate'
    }
  ],
  
  'Excessive Thirst': [
    {
      condition: 'Dehydration',
      probability: 'Common',
      solution: 'Increase fluid intake, electrolyte beverages if needed, avoid caffeine and alcohol.',
      urgency: 'Low'
    },
    {
      condition: 'Diabetes',
      probability: 'Common',
      solution: 'Blood glucose testing, appropriate diet, exercise, and medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    },
    {
      condition: 'Diabetes Insipidus',
      probability: 'Rare',
      solution: 'Endocrinology evaluation, specific hormone testing, medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Dry Mouth Conditions',
      probability: 'Common',
      solution: 'Address underlying cause, artificial saliva products, good dental hygiene.',
      urgency: 'Low'
    }
  ],
  
  'Swollen Face': [
    {
      condition: 'Allergic Reaction',
      probability: 'Common',
      solution: 'SEEK IMMEDIATE MEDICAL CARE for severe facial swelling, especially with breathing difficulty.',
      urgency: 'High to Critical'
    },
    {
      condition: 'Dental Abscess',
      probability: 'Common',
      solution: 'Dental evaluation, antibiotics, possible drainage, pain management.',
      urgency: 'High'
    },
    {
      condition: 'Sinusitis',
      probability: 'Common',
      solution: 'Decongestants, nasal corticosteroids, antibiotics if bacterial, warm compresses.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Possible',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Kidney Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, kidney function tests, appropriate management based on diagnosis.',
      urgency: 'High'
    },
    {
      condition: 'Cellulitis',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotics, possibly hospitalization if severe.',
      urgency: 'High'
    }
  ],
  
  'Tongue Swelling': [
    {
      condition: 'Allergic Reaction',
      probability: 'Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY, especially if breathing is affected.',
      urgency: 'Critical'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY if severe or affecting breathing.',
      urgency: 'Critical'
    },
    {
      condition: 'Angioedema',
      probability: 'Possible',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY, possibly epinephrine, antihistamines, steroids.',
      urgency: 'Critical'
    },
    {
      condition: 'Infection',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotics if bacterial, supportive care.',
      urgency: 'High'
    },
    {
      condition: 'Vitamin Deficiencies',
      probability: 'Less Common',
      solution: 'Nutritional assessment, appropriate supplementation if deficient.',
      urgency: 'Low'
    }
  ],
  
  'Yellowing of Skin': [
    {
      condition: 'Jaundice',
      probability: 'Definite',
      solution: 'SEEK MEDICAL ATTENTION for proper diagnosis of underlying cause.',
      urgency: 'High'
    },
    {
      condition: 'Hepatitis',
      probability: 'Possible',
      solution: 'Medical evaluation, liver function tests, supportive care, specific treatment based on type.',
      urgency: 'High'
    },
    {
      condition: 'Gallbladder Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, ultrasound, possible surgery depending on diagnosis.',
      urgency: 'High'
    },
    {
      condition: 'Pancreatic Cancer',
      probability: 'Less Common',
      solution: 'Prompt medical evaluation, imaging studies, specialized treatment.',
      urgency: 'High'
    },
    {
      condition: 'Alcohol-Related Liver Disease',
      probability: 'Possible',
      solution: 'Stop alcohol consumption, medical evaluation, liver function tests, supportive care.',
      urgency: 'High'
    },
    {
      condition: 'Gilberts Syndrome',
      probability: 'Possible',
      solution: 'Usually no treatment needed, avoid fasting, manage stress.',
      urgency: 'Low'
    }
  ],
  
  'Swollen Glands': [
    {
      condition: 'Infection (Bacterial/Viral)',
      probability: 'Common',
      solution: 'Treat underlying infection, rest, appropriate antibiotics if bacterial.',
      urgency: 'Moderate'
    },
    {
      condition: 'Mononucleosis',
      probability: 'Possible (especially in young adults)',
      solution: 'Rest, hydration, over-the-counter pain relievers for comfort, avoid contact sports.',
      urgency: 'Moderate'
    },
    {
      condition: 'Strep Throat',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotic treatment if diagnosed, rest and hydration.',
      urgency: 'Moderate'
    },
    {
      condition: 'HIV Infection',
      probability: 'Possible',
      solution: 'HIV testing, medical care if positive.',
      urgency: 'High'
    },
    {
      condition: 'Lymphoma',
      probability: 'Less Common',
      solution: 'Medical evaluation for persistent, painless, enlarged lymph nodes.',
      urgency: 'High'
    },
    {
      condition: 'Autoimmune Disorders',
      probability: 'Possible',
      solution: 'Medical evaluation, appropriate treatment based on specific diagnosis.',
      urgency: 'Moderate'
    }
  ],
  
  'Intolerance to Cold': [
    {
      condition: 'Hypothyroidism',
      probability: 'Common',
      solution: 'Thyroid function tests, thyroid hormone replacement therapy if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anemia',
      probability: 'Common',
      solution: 'Blood tests, iron or other supplements based on cause, dietary changes.',
      urgency: 'Moderate'
    },
    {
      condition: 'Raynauds Phenomenon',
      probability: 'Possible',
      solution: 'Keep extremities warm, avoid triggers, calcium channel blockers if severe.',
      urgency: 'Low'
    },
    {
      condition: 'Poor Circulation',
      probability: 'Common',
      solution: 'Regular exercise, elevate legs when sitting, avoid smoking, maintain healthy weight.',
      urgency: 'Low'
    },
    {
      condition: 'Vitamin B12 Deficiency',
      probability: 'Possible',
      solution: 'Blood tests, B12 supplements or injections if deficient.',
      urgency: 'Moderate'
    }
  ],
  
  'Intolerance to Heat': [
    {
      condition: 'Hyperthyroidism',
      probability: 'Common',
      solution: 'Thyroid function tests, antithyroid medications, radioactive iodine, or surgery if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Menopause',
      probability: 'Common (in middle-aged women)',
      solution: 'Hormone replacement therapy if appropriate, cooling clothing, lifestyle adaptations.',
      urgency: 'Low'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, dont stop prescribed medications without consultation.',
      urgency: 'Low'
    },
    {
      condition: 'Multiple Sclerosis',
      probability: 'Less Common',
      solution: 'Neurological evaluation, cooling strategies, disease-modifying therapies if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Autonomic Dysfunction',
      probability: 'Possible',
      solution: 'Medical evaluation, cooling strategies, specific treatments based on diagnosis.',
      urgency: 'Moderate'
    }
  ],
  
  'Unintended Weight Change': [
    {
      condition: 'Thyroid Disorders',
      probability: 'Common',
      solution: 'Thyroid function tests, appropriate medication based on specific diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Diabetes',
      probability: 'Common',
      solution: 'Blood glucose testing, appropriate diet, exercise, and medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Depression',
      probability: 'Common',
      solution: 'Mental health evaluation, therapy, potentially medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Digestive Disorders',
      probability: 'Common',
      solution: 'Gastroenterologist evaluation, specific testing and treatment based on diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cancer',
      probability: 'Less Common',
      solution: 'Medical evaluation for unexplained significant weight changes.',
      urgency: 'High'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, dont stop prescribed medications without consultation.',
      urgency: 'Moderate'
    }
  ],
  
  'Excessive Hunger': [
    {
      condition: 'Diabetes',
      probability: 'Common',
      solution: 'Blood glucose testing, appropriate diet, exercise, and medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hyperthyroidism',
      probability: 'Common',
      solution: 'Thyroid function tests, antithyroid medications, radioactive iodine, or surgery if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    },
    {
      condition: 'Stress/Anxiety',
      probability: 'Common',
      solution: 'Stress management, mindfulness practices, possibly therapy.',
      urgency: 'Low'
    },
    {
      condition: 'Hypoglycemia',
      probability: 'Possible',
      solution: 'Eat small, frequent meals, balance carbohydrates with protein, medical evaluation.',
      urgency: 'Moderate'
    }
  ],
  
  // RESPIRATORY SYMPTOMS
  Cough: [
    {
      condition: 'Common Cold',
      probability: 'Common',
      solution: 'Drink warm fluids (e.g., herbal tea, soup). Use a humidifier to ease throat irritation. Try honey with warm water.',
      urgency: 'Low'
    },
    {
      condition: 'Bronchitis',
      probability: 'Possible',
      solution: 'Rest, drink plenty of fluids, use a humidifier, consider cough suppressants at night.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pneumonia',
      probability: 'Less Common',
      solution: 'Seek medical attention for proper diagnosis and treatment. May require antibiotics if bacterial.',
      urgency: 'High'
    },
    {
      condition: 'Asthma',
      probability: 'Possible',
      solution: 'Use prescribed inhalers, avoid triggers, seek emergency care if breathing becomes severely difficult.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'COVID-19',
      probability: 'Possible',
      solution: 'Get tested, self-isolate, monitor symptoms, contact healthcare provider for guidance.',
      urgency: 'High'
    }
  ],
  
  'Sore Throat': [
    {
      condition: 'Viral Pharyngitis',
      probability: 'Common',
      solution: 'Gargle with salt water, drink warm liquids, use throat lozenges, consider pain relievers.',
      urgency: 'Low'
    },
    {
      condition: 'Strep Throat',
      probability: 'Possible',
      solution: 'See a doctor for diagnosis and possible antibiotic treatment. Rest and hydration important.',
      urgency: 'Moderate'
    },
    {
      condition: 'Tonsillitis',
      probability: 'Possible',
      solution: 'Antibiotics if bacterial, pain relievers, gargling with salt water, plenty of fluids.',
      urgency: 'Moderate'
    },
    {
      condition: 'Laryngitis',
      probability: 'Possible',
      solution: 'Rest your voice, use a humidifier, avoid dehydration, avoid smoking and alcohol.',
      urgency: 'Low'
    }
  ],
  
  'Shortness of Breath': [
    {
      condition: 'Asthma',
      probability: 'Common',
      solution: 'Use rescue inhaler, follow asthma action plan, avoid triggers, seek emergency care if severe.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Deep breathing exercises, relaxation techniques, counseling or therapy.',
      urgency: 'Low to Moderate'
    },
    {
      condition: 'COPD',
      probability: 'Possible',
      solution: 'Bronchodilators, pulmonary rehabilitation, oxygen therapy if prescribed, smoking cessation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pneumonia',
      probability: 'Possible',
      solution: 'Antibiotics if bacterial, rest, fluids, seek immediate care if breathing is very difficult.',
      urgency: 'High'
    },
    {
      condition: 'Pulmonary Embolism',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY. This is a serious condition requiring prompt treatment.',
      urgency: 'Critical'
    },
    {
      condition: 'Heart Failure',
      probability: 'Possible',
      solution: 'Seek immediate medical attention for proper diagnosis and treatment plan.',
      urgency: 'High'
    }
  ],
  
  'Chest Tightness': [
    {
      condition: 'Anxiety/Panic Attack',
      probability: 'Common',
      solution: 'Deep breathing exercises, grounding techniques, possibly therapy or medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'Asthma',
      probability: 'Common',
      solution: 'Use rescue inhaler as prescribed, follow asthma action plan, avoid triggers.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Heart Attack',
      probability: 'Possible',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY by calling local emergency services.',
      urgency: 'Critical'
    },
    {
      condition: 'Gastroesophageal Reflux',
      probability: 'Common',
      solution: 'Avoid trigger foods, eat smaller meals, do not lie down after eating, consider antacids.',
      urgency: 'Low'
    },
    {
      condition: 'Muscle Strain',
      probability: 'Common',
      solution: 'Rest, apply heat, over-the-counter pain relievers, gentle stretching.',
      urgency: 'Low'
    },
    {
      condition: 'Pulmonary Embolism',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY. This is a medical emergency requiring prompt treatment.',
      urgency: 'Critical'
    }
  ],
  
  Wheezing: [
    {
      condition: 'Asthma',
      probability: 'Common',
      solution: 'Use rescue inhaler as prescribed, follow asthma action plan, avoid triggers.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'COPD',
      probability: 'Common (especially in smokers)',
      solution: 'Bronchodilators, quit smoking, pulmonary rehabilitation, oxygen therapy if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Bronchitis',
      probability: 'Common',
      solution: 'Rest, increased fluids, humidifier, possibly bronchodilators or antibiotics if bacterial.',
      urgency: 'Moderate'
    },
    {
      condition: 'Allergic Reaction',
      probability: 'Possible',
      solution: 'Remove allergen if known, antihistamines, seek emergency care if severe or with other symptoms.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Heart Failure',
      probability: 'Possible',
      solution: 'Seek medical attention for proper diagnosis and treatment plan.',
      urgency: 'High'
    }
  ],
  
  Hoarseness: [
    {
      condition: 'Laryngitis',
      probability: 'Common',
      solution: 'Voice rest, hydration, humidifier, avoid irritants like smoking.',
      urgency: 'Low'
    },
    {
      condition: 'Voice Overuse',
      probability: 'Common',
      solution: 'Voice rest, proper speaking techniques, hydration.',
      urgency: 'Low'
    },
    {
      condition: 'Gastroesophageal Reflux',
      probability: 'Common',
      solution: 'Avoid trigger foods, eat smaller meals, do not lie down after eating, consider acid reducers.',
      urgency: 'Low'
    },
    {
      condition: 'Thyroid Issues',
      probability: 'Possible',
      solution: 'Thyroid function tests, appropriate treatment based on diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Vocal Cord Growths',
      probability: 'Less Common',
      solution: 'ENT evaluation, especially for persistent hoarseness longer than 2-3 weeks.',
      urgency: 'Moderate'
    }
  ],
  
  Nosebleed: [
    {
      condition: 'Dry Air/Low Humidity',
      probability: 'Very Common',
      solution: 'Use humidifier, saline nasal spray, petroleum jelly inside nostrils, proper pinching technique.',
      urgency: 'Low'
    },
    {
      condition: 'Trauma',
      probability: 'Common',
      solution: 'Apply pressure by pinching soft part of nose for 10-15 minutes, sit upright, lean forward.',
      urgency: 'Low to Moderate'
    },
    {
      condition: 'High Blood Pressure',
      probability: 'Possible',
      solution: 'Blood pressure monitoring, prescribed medications, lifestyle modifications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Blood Thinning Medications',
      probability: 'Common (in those taking them)',
      solution: 'Apply proper pressure, seek medical attention if prolonged or severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Bleeding Disorders',
      probability: 'Less Common',
      solution: 'Medical evaluation, especially for recurrent or severe nosebleeds.',
      urgency: 'Moderate to High'
    }
  ],
  
  'Runny Nose': [
    {
      condition: 'Common Cold',
      probability: 'Very Common',
      solution: 'Rest, hydration, over-the-counter decongestants or antihistamines if needed.',
      urgency: 'Low'
    },
    {
      condition: 'Allergies',
      probability: 'Very Common',
      solution: 'Identify and avoid triggers, antihistamines, nasal corticosteroids.',
      urgency: 'Low'
    },
    {
      condition: 'Sinusitis',
      probability: 'Common',
      solution: 'Nasal irrigation, decongestants, antibiotics if bacterial and severe.',
      urgency: 'Low'
    },
    {
      condition: 'Non-Allergic Rhinitis',
      probability: 'Common',
      solution: 'Avoid triggers (e.g., irritants, temperature changes), nasal corticosteroids.',
      urgency: 'Low'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Possible',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    }
  ],
  
  Sneezing: [
    {
      condition: 'Allergies',
      probability: 'Very Common',
      solution: 'Identify and avoid triggers, antihistamines, nasal corticosteroids.',
      urgency: 'Low'
    },
    {
      condition: 'Common Cold',
      probability: 'Very Common',
      solution: 'Rest, hydration, over-the-counter cold medications if needed.',
      urgency: 'Low'
    },
    {
      condition: 'Environmental Irritants',
      probability: 'Common',
      solution: 'Identify and avoid triggers, air purifiers, masks in dusty environments.',
      urgency: 'Low'
    },
    {
      condition: 'Rhinitis',
      probability: 'Common',
      solution: 'Nasal corticosteroids, antihistamines, avoid triggers.',
      urgency: 'Low'
    }
  ],
  
  'Nasal Congestion': [
    {
      condition: 'Common Cold',
      probability: 'Very Common',
      solution: 'Saline nasal spray, humidifier, over-the-counter decongestants (short-term use).',
      urgency: 'Low'
    },
    {
      condition: 'Allergies',
      probability: 'Very Common',
      solution: 'Identify and avoid triggers, antihistamines, nasal corticosteroids.',
      urgency: 'Low'
    },
    {
      condition: 'Sinusitis',
      probability: 'Common',
      solution: 'Nasal irrigation, decongestants, antibiotics if bacterial and severe.',
      urgency: 'Low to Moderate'
    },
    {
      condition: 'Nasal Polyps',
      probability: 'Less Common',
      solution: 'Nasal corticosteroids, possibly surgical removal if severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Deviated Septum',
      probability: 'Common',
      solution: 'Nasal strips, decongestants, possibly surgical correction if severe.',
      urgency: 'Low'
    }
  ],
  
  'Post-Nasal Drip': [
    {
      condition: 'Allergies',
      probability: 'Common',
      solution: 'Antihistamines, nasal corticosteroids, saline nasal rinses.',
      urgency: 'Low'
    },
    {
      condition: 'Sinusitis',
      probability: 'Common',
      solution: 'Nasal irrigation, decongestants, antibiotics if bacterial and severe.',
      urgency: 'Low to Moderate'
    },
    {
      condition: 'Gastroesophageal Reflux',
      probability: 'Possible',
      solution: 'Dietary changes, avoid eating before bedtime, consider acid reducers.',
      urgency: 'Low'
    },
    {
      condition: 'Environmental Irritants',
      probability: 'Common',
      solution: 'Identify and avoid triggers, air purifiers, adequate hydration.',
      urgency: 'Low'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Possible',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    }
  ],
  
  'Frequent Coughing': [
    {
      condition: 'Asthma',
      probability: 'Common',
      solution: 'Use prescribed inhalers, identify and avoid triggers, follow asthma action plan.',
      urgency: 'Moderate'
    },
    {
      condition: 'Post-Viral Cough',
      probability: 'Common',
      solution: 'Time, hydration, honey with warm water, cough suppressants if needed for sleep.',
      urgency: 'Low'
    },
    {
      condition: 'Gastroesophageal Reflux',
      probability: 'Common',
      solution: 'Dietary changes, avoid eating before bedtime, consider acid reducers.',
      urgency: 'Low'
    },
    {
      condition: 'COPD',
      probability: 'Common (especially in smokers)',
      solution: 'Bronchodilators, quit smoking, pulmonary rehabilitation, oxygen therapy if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'ACE Inhibitor Medication',
      probability: 'Common (in those taking them)',
      solution: 'Medical consultation about possible medication change, do not stop without doctor advice.',
      urgency: 'Moderate'
    }
  ],
  
  'Coughing Blood': [
    {
      condition: 'Bronchitis',
      probability: 'Common',
      solution: 'SEEK MEDICAL ATTENTION for proper evaluation, especially if more than streaks.',
      urgency: 'High'
    },
    {
      condition: 'Pneumonia',
      probability: 'Common',
      solution: 'SEEK MEDICAL ATTENTION for proper evaluation and treatment.',
      urgency: 'High'
    },
    {
      condition: 'Tuberculosis',
      probability: 'Less Common',
      solution: 'SEEK MEDICAL ATTENTION for proper evaluation and treatment.',
      urgency: 'High'
    },
    {
      condition: 'Pulmonary Embolism',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY. This is a medical emergency requiring prompt treatment.',
      urgency: 'Critical'
    },
    {
      condition: 'Lung Cancer',
      probability: 'Less Common',
      solution: 'SEEK MEDICAL ATTENTION for proper evaluation, especially if a smoker or ex-smoker.',
      urgency: 'High'
    }
  ],
  
  'Difficulty Breathing': [
    {
      condition: 'Asthma',
      probability: 'Common',
      solution: 'Use rescue inhaler as prescribed, follow asthma action plan, seek emergency care if severe.',
      urgency: 'High'
    },
    {
      condition: 'Anxiety/Panic Attack',
      probability: 'Common',
      solution: 'Deep breathing exercises, grounding techniques, possibly therapy or medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'COPD',
      probability: 'Common (especially in smokers)',
      solution: 'Bronchodilators, quit smoking, pulmonary rehabilitation, oxygen therapy if prescribed.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Pneumonia',
      probability: 'Possible',
      solution: 'Seek medical attention for proper diagnosis and treatment.',
      urgency: 'High'
    },
    {
      condition: 'Heart Failure',
      probability: 'Possible',
      solution: 'SEEK MEDICAL ATTENTION for proper diagnosis and treatment plan.',
      urgency: 'High'
    },
    {
      condition: 'Pulmonary Embolism',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY. This is a medical emergency requiring prompt treatment.',
      urgency: 'Critical'
    }
  ],
  
  'Shortness of Breath at Night': [
    {
      condition: 'Heart Failure',
      probability: 'Common',
      solution: 'Sleep with head elevated, seek medical attention for proper diagnosis and treatment.',
      urgency: 'High'
    },
    {
      condition: 'Asthma',
      probability: 'Common',
      solution: 'Use rescue inhaler as prescribed, follow asthma action plan, control environmental triggers.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Sleep Apnea',
      probability: 'Common',
      solution: 'Sleep study for diagnosis, CPAP therapy if prescribed, weight management if overweight.',
      urgency: 'Moderate'
    },
    {
      condition: 'Gastroesophageal Reflux',
      probability: 'Common',
      solution: 'Avoid eating before bed, elevate head of bed, consider acid reducers.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Stress management, relaxation techniques before bed, possibly therapy.',
      urgency: 'Moderate'
    }
  ],
  
  // CARDIOVASCULAR SYMPTOMS
  'Chest Pain': [
    {
      condition: 'Muscle Strain',
      probability: 'Common',
      solution: 'Rest, apply heat, consider anti-inflammatory medication like ibuprofen.',
      urgency: 'Low'
    },
    {
      condition: 'Acid Reflux',
      probability: 'Common',
      solution: 'Avoid trigger foods, eat smaller meals, do not lie down after eating, consider antacids.',
      urgency: 'Low'
    },
    {
      condition: 'Angina',
      probability: 'Possible',
      solution: 'Seek medical evaluation, rest, nitroglycerin if prescribed.',
      urgency: 'High'
    },
    {
      condition: 'Heart Attack',
      probability: 'Possible',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY by calling local emergency services.',
      urgency: 'Critical'
    },
    {
      condition: 'Pulmonary Embolism',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY. This is a medical emergency requiring prompt treatment.',
      urgency: 'Critical'
    },
    {
      condition: 'Pneumonia',
      probability: 'Possible',
      solution: 'Seek medical attention for diagnosis and appropriate treatment (antibiotics if bacterial).',
      urgency: 'High'
    },
    {
      condition: 'Costochondritis',
      probability: 'Possible',
      solution: 'Anti-inflammatory medications, rest, heat or ice application to the affected area.',
      urgency: 'Low'
    }
  ],
  
  Palpitations: [
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Stress management, deep breathing exercises, avoid caffeine and stimulants.',
      urgency: 'Low'
    },
    {
      condition: 'Premature Ventricular Contractions',
      probability: 'Common',
      solution: 'Reduce caffeine and alcohol, manage stress, medical evaluation if frequent or concerning.',
      urgency: 'Low to Moderate'
    },
    {
      condition: 'Atrial Fibrillation',
      probability: 'Possible',
      solution: 'Medical evaluation, possible medications, lifestyle modifications, sometimes procedures.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Hyperthyroidism',
      probability: 'Possible',
      solution: 'Medical evaluation, thyroid function tests, appropriate treatment for thyroid condition.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anemia',
      probability: 'Possible',
      solution: 'Blood tests to confirm, iron supplementation or other treatments based on cause.',
      urgency: 'Moderate'
    }
  ],
  
  'Swollen Ankles': [
    {
      condition: 'Prolonged Standing/Sitting',
      probability: 'Common',
      solution: 'Elevate legs, take breaks to move around, compression stockings.',
      urgency: 'Low'
    },
    {
      condition: 'Heart Failure',
      probability: 'Possible',
      solution: 'Medical evaluation, possibly diuretics, limit salt intake, regular monitoring.',
      urgency: 'High'
    },
    {
      condition: 'Kidney Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, specific treatment based on kidney function and diagnosis.',
      urgency: 'High'
    },
    {
      condition: 'Venous Insufficiency',
      probability: 'Common',
      solution: 'Compression stockings, elevate legs, regular exercise, avoid prolonged standing.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pregnancy',
      probability: 'Common (in pregnant women)',
      solution: 'Elevate legs, stay hydrated, limit salt, regular prenatal care.',
      urgency: 'Low to Moderate'
    }
  ],
  
  'Cold Hands or Feet': [
    {
      condition: 'Raynauds Phenomenon',
      probability: 'Common',
      solution: 'Keep extremities warm, avoid triggers (cold, stress), possibly medication if severe.',
      urgency: 'Low'
    },
    {
      condition: 'Poor Circulation',
      probability: 'Common',
      solution: 'Regular exercise, avoid smoking, maintain healthy weight, keep extremities warm.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hypothyroidism',
      probability: 'Possible',
      solution: 'Thyroid function tests, thyroid hormone replacement therapy if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Peripheral Artery Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, exercise program, medications, possibly procedures if severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anemia',
      probability: 'Possible',
      solution: 'Blood tests, iron or other supplements based on cause, dietary changes.',
      urgency: 'Moderate'
    }
  ],
  
  'Increased Heart Rate': [
    {
      condition: 'Anxiety',
      probability: 'Very Common',
      solution: 'Stress management, deep breathing exercises, avoid caffeine and stimulants.',
      urgency: 'Low'
    },
    {
      condition: 'Dehydration',
      probability: 'Common',
      solution: 'Increase fluid intake, electrolyte beverages if needed.',
      urgency: 'Low to Moderate'
    },
    {
      condition: 'Fever',
      probability: 'Common',
      solution: 'Treat underlying cause, rest, stay hydrated, fever reducers if needed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hyperthyroidism',
      probability: 'Possible',
      solution: 'Thyroid function tests, antithyroid medications, radioactive iodine, or surgery if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Atrial Fibrillation',
      probability: 'Possible',
      solution: 'Medical evaluation, possible medications, cardioversion, or ablation procedures.',
      urgency: 'High'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    }
  ],
  
  'Blood Pressure Changes': [
    {
      condition: 'Hypertension',
      probability: 'Very Common',
      solution: 'Lifestyle modifications (diet, exercise, stress management), medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hypotension',
      probability: 'Less Common',
      solution: 'Rise slowly from lying/sitting, stay hydrated, possibly medication adjustments.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Endocrine Disorders',
      probability: 'Possible',
      solution: 'Medical evaluation, specific treatment based on diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Kidney Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, specific treatment based on kidney function and diagnosis.',
      urgency: 'High'
    }
  ],
  
  'Abnormal Heart Rhythm': [
    {
      condition: 'Atrial Fibrillation',
      probability: 'Common',
      solution: 'Medical evaluation, possible blood thinners, rate or rhythm control medications.',
      urgency: 'High'
    },
    {
      condition: 'Premature Ventricular Contractions',
      probability: 'Common',
      solution: 'Reduce caffeine and alcohol, manage stress, medical evaluation if frequent or concerning.',
      urgency: 'Moderate'
    },
    {
      condition: 'Electrolyte Imbalances',
      probability: 'Possible',
      solution: 'Blood tests, appropriate electrolyte replacement based on results.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Thyroid Disorders',
      probability: 'Possible',
      solution: 'Thyroid function tests, appropriate medication based on diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Structural Heart Disease',
      probability: 'Possible',
      solution: 'Thorough cardiac evaluation, specific treatment based on diagnosis.',
      urgency: 'High'
    }
  ],
  
  'Varicose Veins': [
    {
      condition: 'Chronic Venous Insufficiency',
      probability: 'Common',
      solution: 'Compression stockings, elevate legs, regular exercise, avoid prolonged standing.',
      urgency: 'Low'
    },
    {
      condition: 'Genetic Predisposition',
      probability: 'Common',
      solution: 'Compression stockings, elevate legs, regular exercise, possibly procedures if symptomatic.',
      urgency: 'Low'
    },
    {
      condition: 'Pregnancy',
      probability: 'Common (in pregnant women)',
      solution: 'Compression stockings, elevate legs, regular exercise, usually improves after delivery.',
      urgency: 'Low'
    },
    {
      condition: 'Obesity',
      probability: 'Common',
      solution: 'Weight management, regular exercise, compression stockings.',
      urgency: 'Low'
    },
    {
      condition: 'Prolonged Standing',
      probability: 'Common',
      solution: 'Take breaks to move around, compression stockings, elevate legs when resting.',
      urgency: 'Low'
    }
  ],
  
  'Leg Swelling': [
    {
      condition: 'Venous Insufficiency',
      probability: 'Common',
      solution: 'Compression stockings, elevate legs, regular exercise, avoid prolonged standing.',
      urgency: 'Moderate'
    },
    {
      condition: 'Heart Failure',
      probability: 'Possible',
      solution: 'Medical evaluation, possibly diuretics, limit salt intake, regular monitoring.',
      urgency: 'High'
    },
    {
      condition: 'Kidney Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, specific treatment based on kidney function and diagnosis.',
      urgency: 'High'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Lymphedema',
      probability: 'Less Common',
      solution: 'Compression garments, lymphatic drainage massage, meticulous skin care.',
      urgency: 'Moderate'
    },
    {
      condition: 'Deep Vein Thrombosis',
      probability: 'Less Common',
      solution: 'SEEK MEDICAL ATTENTION if swelling is sudden, painful, or in one leg only.',
      urgency: 'High to Critical'
    }
  ],
  
  'Dizziness When Standing': [
    {
      condition: 'Orthostatic Hypotension',
      probability: 'Common',
      solution: 'Rise slowly from sitting/lying, stay hydrated, consider compression stockings.',
      urgency: 'Moderate'
    },
    {
      condition: 'Dehydration',
      probability: 'Common',
      solution: 'Increase fluid intake, electrolyte beverages if needed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anemia',
      probability: 'Possible',
      solution: 'Blood tests, iron or other supplements based on cause, dietary changes.',
      urgency: 'Moderate'
    },
    {
      condition: 'Dysautonomia',
      probability: 'Less Common',
      solution: 'Medical evaluation, increased salt and fluid intake, possibly medications.',
      urgency: 'Moderate'
    }
  ],
  
  // DIGESTIVE SYMPTOMS
  Nausea: [
    
  
      {
        condition: 'Gastroenteritis',
        probability: 'Common',
        solution: 'Stay hydrated, rest, eat bland foods when able, anti-nausea medication if needed.',
        urgency: 'Low to Moderate'
      },
      {
        condition: 'Food Poisoning',
        probability: 'Possible',
        solution: 'Hydration, rest, avoid solid food temporarily, seek medical help if severe.',
        urgency: 'Moderate'
      },
      {
        condition: 'Migraine',
        probability: 'Possible',
        solution: 'Rest in dark quiet room, migraine medications, anti-nausea medications, stay hydrated.',
        urgency: 'Moderate'
      },
      {
        condition: 'Pregnancy',
        probability: 'Possible',
        solution: 'Small frequent meals, ginger tea, vitamin B6, prescription medication if severe.',
        urgency: 'Low'
      },
      {
        condition: 'Medication Side Effect',
        probability: 'Possible',
        solution: 'Take with food if appropriate, discuss with doctor about alternative medications.',
        urgency: 'Moderate'
      },
      {
        condition: 'Motion Sickness',
        probability: 'Common',
        solution: 'Anti-motion sickness medication, focus on horizon, fresh air, avoid reading in vehicle.',
        urgency: 'Low'
      }
  
  ],
  
  'Abdominal Pain': [
    {
      condition: 'Gastritis',
      probability: 'Common',
      solution: 'Avoid spicy foods, alcohol, and NSAIDs. Consider antacids. Eat smaller meals.',
      urgency: 'Moderate'
    },
    {
      condition: 'Irritable Bowel Syndrome',
      probability: 'Common',
      solution: 'Identify trigger foods, manage stress, regular exercise, consider fiber supplements.',
      urgency: 'Low'
    },
    {
      condition: 'Appendicitis',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE if severe pain in lower right abdomen, especially with fever.',
      urgency: 'Critical'
    },
    {
      condition: 'Food Poisoning',
      probability: 'Possible',
      solution: 'Stay hydrated, rest, eat bland foods when able, seek medical help if severe symptoms.',
      urgency: 'Moderate'
    },
    {
      condition: 'Gastroenteritis',
      probability: 'Common',
      solution: 'Replace fluids and electrolytes, rest, gradually introduce bland foods, seek help if severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Gallstones',
      probability: 'Possible',
      solution: 'Medical evaluation for diagnosis, possible medications or surgery, dietary changes.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Kidney Stones',
      probability: 'Possible',
      solution: 'Pain management, increased fluid intake, medical evaluation, possible procedures.',
      urgency: 'High'
    },
    {
      condition: 'Peptic Ulcer',
      probability: 'Possible',
      solution: 'Antibiotics if H. pylori is present, acid-reducing medications, avoid NSAIDs and smoking.',
      urgency: 'Moderate'
    }
  
  ],
  
  Diarrhea: [
    {
      condition: 'Gastroenteritis',
      probability: 'Very Common',
      solution: 'Stay hydrated with water, broth, or electrolyte solutions. Follow BRAT diet (bananas, rice, applesauce, toast).',
      urgency: 'Moderate'
    },
    {
      condition: 'Food Poisoning',
      probability: 'Common',
      solution: 'Stay hydrated, rest, seek medical attention if symptoms are severe or last more than 2 days.',
      urgency: 'Moderate'
    },
    {
      condition: 'Irritable Bowel Syndrome',
      probability: 'Common',
      solution: 'Identify and avoid trigger foods, stress management, fiber supplements, probiotics.',
      urgency: 'Low'
    },
    {
      condition: 'Inflammatory Bowel Disease',
      probability: 'Less Common',
      solution: 'Anti-inflammatory medications, immunosuppressants, dietary changes, regular medical care.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Possible',
      solution: 'Discuss with doctor, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    }
  ],
  
  Constipation: [
    {
      condition: 'Dietary Factors',
      probability: 'Very Common',
      solution: 'Increase fiber intake, stay well-hydrated, regular physical activity, establish toilet routine.',
      urgency: 'Low'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Discuss with healthcare provider, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    },
    {
      condition: 'Irritable Bowel Syndrome',
      probability: 'Common',
      solution: 'Dietary modifications, regular exercise, stress management, fiber supplements.',
      urgency: 'Low'
    },
    {
      condition: 'Hypothyroidism',
      probability: 'Possible',
      solution: 'Medical evaluation, thyroid hormone replacement therapy if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Intestinal Obstruction',
      probability: 'Rare',
      solution: 'SEEK EMERGENCY CARE if severe pain, vomiting, inability to pass gas or have bowel movement.',
      urgency: 'Critical'
    }
  ],


'Difficulty Swallowing': [
    {
      condition: 'Gastroesophageal Reflux Disease',
      probability: 'Common',
      solution: 'Diet modifications, avoid eating before bedtime, elevation of head while sleeping, medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Relaxation techniques, small bites, chew thoroughly, stay hydrated, possibly counseling.',
      urgency: 'Low'
    },
    {
      condition: 'Esophagitis',
      probability: 'Possible',
      solution: 'Medical evaluation, medications to reduce acid, avoid irritating foods, possibly endoscopy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Esophageal Stricture',
      probability: 'Possible',
      solution: 'Medical evaluation, possible dilation procedure, medications to reduce acid.',
      urgency: 'Moderate'
    },
    {
      condition: 'Esophageal Cancer',
      probability: 'Less Common',
      solution: 'SEEK MEDICAL EVALUATION if difficulty swallowing is persistent or worsening, especially with weight loss.',
      urgency: 'High'
    },
    {
      condition: 'Stroke',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE if sudden onset, especially with other neurological symptoms.',
      urgency: 'Critical'
    }
  ],
  
  'Burning Sensation in Chest': [
    {
      condition: 'Gastroesophageal Reflux Disease',
      probability: 'Very Common',
      solution: 'Diet modifications, avoid eating before bedtime, elevation of head while sleeping, medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Heartburn',
      probability: 'Very Common',
      solution: 'Avoid trigger foods, eat smaller meals, over-the-counter antacids, wait 3 hours after eating before lying down.',
      urgency: 'Low'
    },
    {
      condition: 'Esophagitis',
      probability: 'Possible',
      solution: 'Medical evaluation, medications to reduce acid, avoid irritating foods, possibly endoscopy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Heart Attack',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE if accompanied by shortness of breath, pain radiating to jaw/arm, sweating, nausea.',
      urgency: 'Critical'
    },
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Stress management techniques, deep breathing exercises, possibly counseling.',
      urgency: 'Low'
    }
  ],
  
  'Blood in Stool': [
    {
      condition: 'Hemorrhoids',
      probability: 'Very Common',
      solution: 'High-fiber diet, adequate hydration, over-the-counter treatments, warm baths.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anal Fissure',
      probability: 'Common',
      solution: 'High-fiber diet, adequate hydration, stool softeners, warm baths.',
      urgency: 'Moderate'
    },
    {
      condition: 'Inflammatory Bowel Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, anti-inflammatory medications, dietary modifications.',
      urgency: 'High'
    },
    {
      condition: 'Colorectal Cancer',
      probability: 'Possible',
      solution: 'SEEK MEDICAL EVALUATION, especially if over 50 or with family history.',
      urgency: 'High'
    },
    {
      condition: 'Diverticulosis',
      probability: 'Common (especially in older adults)',
      solution: 'High-fiber diet, adequate hydration, medical evaluation if bleeding is significant.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Intestinal Infection',
      probability: 'Possible',
      solution: 'Medical evaluation, specific treatment based on infectious agent.',
      urgency: 'Moderate to High'
    }
  ],
  
  Heartburn: [
    {
      condition: 'Gastroesophageal Reflux Disease',
      probability: 'Very Common',
      solution: 'Diet modifications, avoid eating before bedtime, elevation of head while sleeping, medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hiatal Hernia',
      probability: 'Common',
      solution: 'Smaller meals, avoid lying down after eating, weight loss if overweight, possibly medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pregnancy-Related',
      probability: 'Very Common (in pregnant women)',
      solution: 'Small, frequent meals, avoid trigger foods, do not lie down after eating, approved antacids.',
      urgency: 'Low'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Obesity',
      probability: 'Common',
      solution: 'Weight management, dietary modifications, smaller meals.',
      urgency: 'Moderate'
    }
  ],
  
  Bloating: [
    {
      condition: 'Irritable Bowel Syndrome',
      probability: 'Very Common',
      solution: 'Identify trigger foods, stress management, regular exercise, possibly medications.',
      urgency: 'Low'
    },
    {
      condition: 'Gas/Intestinal Gas',
      probability: 'Very Common',
      solution: 'Identify and limit gas-producing foods, eat slowly, avoid carbonated beverages.',
      urgency: 'Low'
    },
    {
      condition: 'Food Intolerances',
      probability: 'Common',
      solution: 'Elimination diet to identify triggers, food diary, dietary modifications.',
      urgency: 'Low'
    },
    {
      condition: 'Constipation',
      probability: 'Common',
      solution: 'Increase fiber intake, stay well-hydrated, regular exercise, establish toilet routine.',
      urgency: 'Low'
    },
    {
      condition: 'Gynecological Issues (women)',
      probability: 'Common',
      solution: 'Medical evaluation, treatment depends on specific diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Small Intestinal Bacterial Overgrowth',
      probability: 'Possible',
      solution: 'Medical evaluation, specific testing, antibiotics if diagnosed, dietary modifications.',
      urgency: 'Moderate'
    }
  ],
  
  Flatulence: [
    {
      condition: 'Dietary Factors',
      probability: 'Very Common',
      solution: 'Identify and limit gas-producing foods, eat slowly, avoid carbonated beverages.',
      urgency: 'Low'
    },
    {
      condition: 'Food Intolerances',
      probability: 'Common',
      solution: 'Elimination diet to identify triggers, food diary, dietary modifications.',
      urgency: 'Low'
    },
    {
      condition: 'Irritable Bowel Syndrome',
      probability: 'Common',
      solution: 'Identify trigger foods, stress management, regular exercise, possibly medications.',
      urgency: 'Low'
    },
    {
      condition: 'Malabsorption Issues',
      probability: 'Possible',
      solution: 'Medical evaluation, specific treatment based on diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    }
  ],
  
  'Excessive Gas': [
    {
      condition: 'Dietary Factors',
      probability: 'Very Common',
      solution: 'Identify and limit gas-producing foods, eat slowly, avoid carbonated beverages.',
      urgency: 'Low'
    },
    {
      condition: 'Swallowed Air',
      probability: 'Common',
      solution: 'Eat slowly, avoid chewing gum, avoid carbonated beverages, do not use straws.',
      urgency: 'Low'
    },
    {
      condition: 'Lactose Intolerance',
      probability: 'Common',
      solution: 'Limit dairy products, use lactase supplements, try lactose-free alternatives.',
      urgency: 'Low'
    },
    {
      condition: 'Small Intestinal Bacterial Overgrowth',
      probability: 'Possible',
      solution: 'Medical evaluation, specific testing, antibiotics if diagnosed, dietary modifications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Celiac Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, strict gluten-free diet if diagnosed.',
      urgency: 'Moderate'
    }
  ],
  
  Indigestion: [
    {
      condition: 'Overeating',
      probability: 'Very Common',
      solution: 'Smaller portions, eat slowly, chew thoroughly, avoid trigger foods.',
      urgency: 'Low'
    },
    {
      condition: 'Gastroesophageal Reflux Disease',
      probability: 'Common',
      solution: 'Diet modifications, avoid eating before bedtime, elevation of head while sleeping, medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Gastritis',
      probability: 'Common',
      solution: 'Avoid spicy/acidic foods, alcohol, and NSAIDs, consider antacids, smaller meals.',
      urgency: 'Moderate'
    },
    {
      condition: 'Peptic Ulcer',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotics if H. pylori present, acid-reducing medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Gallbladder Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, dietary modifications, possibly procedures.',
      urgency: 'Moderate'
    },
    {
      condition: 'Heart Attack',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE if accompanied by chest pain, shortness of breath, sweating, nausea.',
      urgency: 'Critical'
    }
  ],
  
  'Reduced Appetite': [
    {
      condition: 'Stress/Anxiety',
      probability: 'Very Common',
      solution: 'Stress management techniques, regular meals, possibly counseling.',
      urgency: 'Low'
    },
    {
      condition: 'Depression',
      probability: 'Common',
      solution: 'Mental health evaluation, therapy, potentially medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Infection',
      probability: 'Common',
      solution: 'Treat underlying infection, maintain nutrition with small, frequent nutrient-dense meals.',
      urgency: 'Moderate'
    },
    {
      condition: 'Digestive Disorders',
      probability: 'Possible',
      solution: 'Medical evaluation, treatment based on specific diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cancer',
      probability: 'Less Common',
      solution: 'Medical evaluation if prolonged or accompanied by weight loss and other symptoms.',
      urgency: 'High'
    }
  ],
  
  'Acid Reflux': [
    {
      condition: 'Gastroesophageal Reflux Disease',
      probability: 'Very Common',
      solution: 'Diet modifications, avoid eating before bedtime, elevation of head while sleeping, medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hiatal Hernia',
      probability: 'Common',
      solution: 'Smaller meals, avoid lying down after eating, weight loss if overweight, possibly medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pregnancy-Related',
      probability: 'Very Common (in pregnant women)',
      solution: 'Small, frequent meals, avoid trigger foods, do not lie down after eating, approved antacids.',
      urgency: 'Low'
    },
    {
      condition: 'Obesity',
      probability: 'Common',
      solution: 'Weight management, dietary modifications, smaller meals.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    }
  ],
  
  'Stomach Cramps': [
    {
      condition: 'Gastroenteritis',
      probability: 'Common',
      solution: 'Rest, hydration, bland diet when tolerated, over-the-counter pain relievers if needed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Irritable Bowel Syndrome',
      probability: 'Common',
      solution: 'Identify trigger foods, stress management, regular exercise, possibly medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Menstrual Cramps (women)',
      probability: 'Very Common',
      solution: 'Over-the-counter pain relievers, heat therapy, gentle exercise, relaxation techniques.',
      urgency: 'Low'
    },
    {
      condition: 'Food Poisoning',
      probability: 'Possible',
      solution: 'Rest, hydration, medical care if severe symptoms or high-risk individuals.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Appendicitis',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE if pain localizes to lower right abdomen, especially with fever.',
      urgency: 'Critical'
    },
    {
      condition: 'Inflammatory Bowel Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, anti-inflammatory medications, dietary modifications.',
      urgency: 'High'
    }
  ],
  
  'Rectal Bleeding': [
    {
      condition: 'Hemorrhoids',
      probability: 'Very Common',
      solution: 'High-fiber diet, adequate hydration, over-the-counter treatments, warm baths.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anal Fissure',
      probability: 'Common',
      solution: 'High-fiber diet, adequate hydration, stool softeners, warm baths.',
      urgency: 'Moderate'
    },
    {
      condition: 'Inflammatory Bowel Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, anti-inflammatory medications, dietary modifications.',
      urgency: 'High'
    },
    {
      condition: 'Colorectal Cancer',
      probability: 'Possible',
      solution: 'SEEK MEDICAL EVALUATION, especially if over 45 or with family history.',
      urgency: 'High'
    },
    {
      condition: 'Diverticulosis',
      probability: 'Common (especially in older adults)',
      solution: 'High-fiber diet, adequate hydration, medical evaluation if bleeding is significant.',
      urgency: 'Moderate to High'
    }
  ],
  
  'Black Stool': [
    {
      condition: 'Upper Gastrointestinal Bleeding',
      probability: 'Possible',
      solution: 'SEEK MEDICAL EVALUATION promptly, especially if accompanied by abdominal pain or vomiting.',
      urgency: 'High'
    },
    {
      condition: 'Iron Supplements',
      probability: 'Common (in those taking them)',
      solution: 'Usually normal side effect, take with food, discuss with doctor if concerned.',
      urgency: 'Low'
    },
    {
      condition: 'Bismuth Medications',
      probability: 'Common (in those taking them)',
      solution: 'Normal side effect of medications like Pepto-Bismol, should resolve when discontinued.',
      urgency: 'Low'
    },
    {
      condition: 'Certain Foods',
      probability: 'Common',
      solution: 'Consider recent intake of blueberries, licorice, or blood sausage.',
      urgency: 'Low'
    },
    {
      condition: 'Peptic Ulcer',
      probability: 'Possible',
      solution: 'SEEK MEDICAL EVALUATION promptly, especially if accompanied by pain or vomiting.',
      urgency: 'High'
    }
  ],
  
  'Pale Stool': [
    {
      condition: 'Bile Duct Obstruction',
      probability: 'Possible',
      solution: 'Medical evaluation, imaging studies, treatment depends on cause of obstruction.',
      urgency: 'High'
    },
    {
      condition: 'Gallbladder Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, dietary modifications, possibly procedures.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hepatitis',
      probability: 'Possible',
      solution: 'Medical evaluation, supportive care, specific treatment depends on type.',
      urgency: 'High'
    },
    {
      condition: 'Pancreatic Disorders',
      probability: 'Possible',
      solution: 'Medical evaluation, treatment depends on specific diagnosis.',
      urgency: 'High'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Dietary Factors',
      probability: 'Common',
      solution: 'Consider recent diet, temporary changes often resolve with normal diet.',
      urgency: 'Low'
    }
  ],
  
  'Greasy Stool': [
    {
      condition: 'Malabsorption',
      probability: 'Common',
      solution: 'Medical evaluation, dietary modifications, specific treatment based on cause.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pancreatic Insufficiency',
      probability: 'Possible',
      solution: 'Medical evaluation, enzyme supplements if diagnosed, dietary modifications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Celiac Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, strict gluten-free diet if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Gallbladder Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, dietary modifications, possibly procedures.',
      urgency: 'Moderate'
    },
    {
      condition: 'Dietary Factors',
      probability: 'Very Common',
      solution: 'Reduce fatty food intake, temporary changes often resolve with normal diet.',
      urgency: 'Low'
    }
  ],
  
  'Bloody Mucus in Stool': [
    {
      condition: 'Inflammatory Bowel Disease',
      probability: 'Common',
      solution: 'Medical evaluation, anti-inflammatory medications, dietary modifications.',
      urgency: 'High'
    },
    {
      condition: 'Infection',
      probability: 'Common',
      solution: 'Medical evaluation, specific treatment based on infectious agent.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Colorectal Cancer',
      probability: 'Possible',
      solution: 'SEEK MEDICAL EVALUATION, especially if over 45 or with family history.',
      urgency: 'High'
    },
    {
      condition: 'Hemorrhoids',
      probability: 'Common',
      solution: 'High-fiber diet, adequate hydration, over-the-counter treatments, warm baths.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anal Fissure',
      probability: 'Common',
      solution: 'High-fiber diet, adequate hydration, stool softeners, warm baths.',
      urgency: 'Moderate'
    }
  ],
  
  // REPRODUCTIVE/SEXUAL SYMPTOMS
  'Genital Itching': [
    {
      condition: 'Fungal Infection',
      probability: 'Very Common',
      solution: 'Over-the-counter antifungal treatments, proper hygiene, wear breathable underwear.',
      urgency: 'Low'
    },
    {
      condition: 'Contact Dermatitis',
      probability: 'Common',
      solution: 'Avoid irritants (soaps, detergents), cotton underwear, mild hydrocortisone if needed.',
      urgency: 'Low'
    },
    {
      condition: 'Sexually Transmitted Infection',
      probability: 'Possible',
      solution: 'Medical evaluation, appropriate antibiotics or antivirals if diagnosed, safe sex practices.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pubic Lice',
      probability: 'Possible',
      solution: 'Over-the-counter treatments, wash all clothing and bedding in hot water.',
      urgency: 'Moderate'
    },
    {
      condition: 'Lichen Sclerosus',
      probability: 'Less Common',
      solution: 'Medical evaluation, prescription steroid cream, regular follow-up.',
      urgency: 'Moderate'
    }
  ],
  
  'Pelvic Pain': [
    {
      condition: 'Menstrual Cramps (women)',
      probability: 'Very Common',
      solution: 'Over-the-counter pain relievers, heat therapy, gentle exercise, relaxation techniques.',
      urgency: 'Low'
    },
    {
      condition: 'Ovulation Pain (women)',
      probability: 'Common',
      solution: 'Over-the-counter pain relievers, heat therapy, usually resolves within 24 hours.',
      urgency: 'Low'
    },
    {
      condition: 'Endometriosis (women)',
      probability: 'Common',
      solution: 'Medical evaluation, hormonal therapies, pain management, possibly laparoscopy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Urinary Tract Infection',
      probability: 'Common',
      solution: 'Medical evaluation, antibiotics if prescribed, increased fluid intake.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pelvic Inflammatory Disease (women)',
      probability: 'Possible',
      solution: 'SEEK MEDICAL CARE, antibiotics, rest, pain management.',
      urgency: 'High'
    },
    {
      condition: 'Prostatitis (men)',
      probability: 'Common (in men)',
      solution: 'Medical evaluation, antibiotics if bacterial, anti-inflammatories, warm baths.',
      urgency: 'Moderate'
    },
    {
      condition: 'Appendicitis',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE if pain is severe, especially with fever or vomiting.',
      urgency: 'Critical'
    }
  ],
  
  'Painful Intercourse': [
    {
      condition: 'Insufficient Lubrication',
      probability: 'Very Common',
      solution: 'Use lubricant, extend foreplay, address potential psychological factors.',
      urgency: 'Low'
    },
    {
      condition: 'Infection',
      probability: 'Common',
      solution: 'Medical evaluation, appropriate treatment based on specific infection.',
      urgency: 'Moderate'
    },
    {
      condition: 'Vaginismus (women)',
      probability: 'Possible',
      solution: 'Pelvic floor physical therapy, counseling, vaginal dilators if recommended.',
      urgency: 'Moderate'
    },
    {
      condition: 'Endometriosis (women)',
      probability: 'Possible',
      solution: 'Medical evaluation, hormonal therapies, pain management, possibly laparoscopy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pelvic Inflammatory Disease (women)',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotics, temporary abstinence during treatment.',
      urgency: 'High'
    },
    {
      condition: 'Prostatitis (men)',
      probability: 'Common (in men)',
      solution: 'Medical evaluation, antibiotics if bacterial, anti-inflammatories, temporary abstinence.',
      urgency: 'Moderate'
    }
  ],
  
  'Swollen Testicle': [
    {
      condition: 'Epididymitis',
      probability: 'Common',
      solution: 'Medical evaluation, antibiotics if bacterial, rest, scrotal support, pain relievers.',
      urgency: 'High'
    },
    {
      condition: 'Orchitis',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotics if bacterial, rest, scrotal support, pain relievers.',
      urgency: 'High'
    },
    {
      condition: 'Testicular Torsion',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY - this is a time-sensitive emergency.',
      urgency: 'Critical'
    },
    {
      condition: 'Hydrocele',
      probability: 'Common',
      solution: 'Medical evaluation, often no treatment needed unless large or uncomfortable.',
      urgency: 'Moderate'
    },
    {
      condition: 'Inguinal Hernia',
      probability: 'Common',
      solution: 'Medical evaluation, possibly surgical repair, avoid heavy lifting.',
      urgency: 'Moderate'
    },
    {
      condition: 'Testicular Cancer',
      probability: 'Less Common',
      solution: 'Medical evaluation, especially if painless swelling or hardness.',
      urgency: 'High'
    }
  ],  'Painful Urination': [
    {
      condition: 'Urinary Tract Infection',
      probability: 'Very Common',
      solution: 'Increased fluid intake, antibiotics if prescribed, cranberry supplements or juice.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sexually Transmitted Infection',
      probability: 'Common',
      solution: 'Medical evaluation, appropriate antibiotics or antivirals if diagnosed, safe sex practices.',
      urgency: 'Moderate'
    },
    {
      condition: 'Interstitial Cystitis',
      probability: 'Possible',
      solution: 'Dietary modifications, pelvic floor physical therapy, medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Kidney Stones',
      probability: 'Possible',
      solution: 'Increased fluid intake, pain management, medical evaluation, possibly procedures.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Prostatitis (men)',
      probability: 'Common (in men)',
      solution: 'Antibiotics if bacterial, anti-inflammatories, warm baths, increased fluid intake.',
      urgency: 'Moderate'
    }
  ],
  
  'Blood in Urine': [
    {
      condition: 'Urinary Tract Infection',
      probability: 'Common',
      solution: 'Medical evaluation, antibiotics if prescribed, increased fluid intake.',
      urgency: 'High'
    },
    {
      condition: 'Kidney Stones',
      probability: 'Common',
      solution: 'Medical evaluation, pain management, increased fluid intake, possible procedures.',
      urgency: 'High'
    },
    {
      condition: 'Bladder or Kidney Cancer',
      probability: 'Less Common',
      solution: 'SEEK PROMPT MEDICAL EVALUATION, especially if persistent or recurrent.',
      urgency: 'High'
    },
    {
      condition: 'Enlarged Prostate (men)',
      probability: 'Common (in older men)',
      solution: 'Medical evaluation, possibly medications or procedures.',
      urgency: 'Moderate'
    },
    {
      condition: 'Strenuous Exercise',
      probability: 'Possible',
      solution: 'Rest, hydration, medical evaluation if persistent after rest.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medications/Foods',
      probability: 'Possible',
      solution: 'Medical review of medications, dietary review (beets, rhubarb can cause red urine).',
      urgency: 'Low'
    }
  ],
  
  Incontinence: [
    {
      condition: 'Stress Incontinence',
      probability: 'Very Common (especially in women)',
      solution: 'Pelvic floor exercises, bladder training, weight loss if overweight, possibly surgery.',
      urgency: 'Moderate'
    },
    {
      condition: 'Urge Incontinence',
      probability: 'Common',
      solution: 'Bladder training, scheduled voiding, pelvic floor exercises, possibly medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Enlarged Prostate (men)',
      probability: 'Common (in older men)',
      solution: 'Medical evaluation, medications, possibly procedures depending on severity.',
      urgency: 'Moderate'
    },
    {
      condition: 'Neurological Disorders',
      probability: 'Possible',
      solution: 'Medical evaluation, bladder management strategies, possibly medications or procedures.',
      urgency: 'Moderate'
    },
    {
      condition: 'Urinary Tract Infection',
      probability: 'Common',
      solution: 'Medical evaluation, antibiotics if prescribed, increased fluid intake.',
      urgency: 'Moderate'
    }
  ],
  
  'Urinary Urgency': [
    {
      condition: 'Urinary Tract Infection',
      probability: 'Very Common',
      solution: 'Medical evaluation, antibiotics if prescribed, increased fluid intake.',
      urgency: 'Moderate'
    },
    {
      condition: 'Overactive Bladder',
      probability: 'Common',
      solution: 'Bladder training, scheduled voiding, pelvic floor exercises, possibly medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'Interstitial Cystitis',
      probability: 'Possible',
      solution: 'Dietary modifications, pelvic floor physical therapy, medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Enlarged Prostate (men)',
      probability: 'Very Common (in older men)',
      solution: 'Medical evaluation, medications, possibly procedures depending on severity.',
      urgency: 'Moderate'
    },
    {
      condition: 'Diabetes',
      probability: 'Possible',
      solution: 'Blood glucose testing, diet management, exercise, medications if prescribed.',
      urgency: 'Moderate'
    }
  ],
  
  'Urinary Frequency': [
    {
      condition: 'Urinary Tract Infection',
      probability: 'Very Common',
      solution: 'Medical evaluation, antibiotics if prescribed, increased fluid intake.',
      urgency: 'Moderate'
    },
    {
      condition: 'Overactive Bladder',
      probability: 'Common',
      solution: 'Bladder training, scheduled voiding, pelvic floor exercises, possibly medication.',
      urgency: 'Moderate'
    },
    {
      condition: 'Diabetes',
      probability: 'Common',
      solution: 'Blood glucose testing, diet management, exercise, medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Enlarged Prostate (men)',
      probability: 'Very Common (in older men)',
      solution: 'Medical evaluation, medications, possibly procedures depending on severity.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Stress management techniques, possibly therapy or counseling.',
      urgency: 'Low'
    },
    {
      condition: 'Bladder Cancer',
      probability: 'Less Common',
      solution: 'Medical evaluation, especially if accompanied by pain or blood in urine.',
      urgency: 'High'
    }
  ],
  
  'Urinary Hesitancy': [
    {
      condition: 'Enlarged Prostate (men)',
      probability: 'Very Common (in older men)',
      solution: 'Medical evaluation, medications, possibly procedures depending on severity.',
      urgency: 'Moderate'
    },
    {
      condition: 'Urinary Tract Infection',
      probability: 'Common',
      solution: 'Medical evaluation, antibiotics if prescribed, increased fluid intake.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do n0t stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Neurological Disorders',
      probability: 'Possible',
      solution: 'Medical evaluation, bladder management strategies, possibly medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Psychological Factors',
      probability: 'Possible',
      solution: 'Privacy when urinating, relaxation techniques, possibly counseling.',
      urgency: 'Low'
    }
  ],
  
  'Decreased Urine Output': [
    {
      condition: 'Dehydration',
      probability: 'Very Common',
      solution: 'Increased fluid intake, oral rehydration solutions, medical evaluation if severe.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Kidney Issues',
      probability: 'Possible',
      solution: 'Medical evaluation, possibly hospitalization if acute kidney injury suspected.',
      urgency: 'High'
    },
    {
      condition: 'Urinary Tract Obstruction',
      probability: 'Possible',
      solution: 'SEEK MEDICAL CARE, especially if accompanied by pain or inability to urinate.',
      urgency: 'High'
    },
    {
      condition: 'Heart Failure',
      probability: 'Possible',
      solution: 'Medical evaluation, fluid and salt restrictions if diagnosed, medications.',
      urgency: 'High'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do n0t stop prescribed medications without consultation.',
      urgency: 'Moderate'
    }
  ],
  
  'Dark Urine': [
    {
      condition: 'Dehydration',
      probability: 'Very Common',
      solution: 'Increased fluid intake, oral rehydration solutions.',
      urgency: 'Moderate'
    },
    {
      condition: 'Liver Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, liver function tests, appropriate treatment based on diagnosis.',
      urgency: 'High'
    },
    {
      condition: 'Hepatitis',
      probability: 'Possible',
      solution: 'Medical evaluation, rest, adequate hydration, specific treatment based on type.',
      urgency: 'High'
    },
    {
      condition: 'Rhabdomyolysis',
      probability: 'Less Common',
      solution: 'SEEK MEDICAL CARE, especially after extreme exercise, crush injuries, or certain medications.',
      urgency: 'High'
    },
    {
      condition: 'Medications/Foods',
      probability: 'Common',
      solution: 'Review medications, consider dietary factors (beets, blackberries, food dyes).',
      urgency: 'Low'
    }
  ],
  
  'Cloudy Urine': [
    {
      condition: 'Urinary Tract Infection',
      probability: 'Very Common',
      solution: 'Medical evaluation, antibiotics if prescribed, increased fluid intake.',
      urgency: 'Moderate'
    },
    {
      condition: 'Kidney Stones',
      probability: 'Possible',
      solution: 'Increased fluid intake, pain management, medical evaluation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Dehydration',
      probability: 'Common',
      solution: 'Increased fluid intake, oral rehydration solutions.',
      urgency: 'Low to Moderate'
    },
    {
      condition: 'Sexually Transmitted Infection',
      probability: 'Possible',
      solution: 'Medical evaluation, appropriate antibiotics or antivirals if diagnosed, safe sex practices.',
      urgency: 'Moderate'
    },
    {
      condition: 'Dietary Factors',
      probability: 'Common',
      solution: 'Dietary review, increased water intake, temporary food diary if concerned.',
      urgency: 'Low'
    }
  ],
  
  'Foamy Urine': [
    {
      condition: 'Protein in Urine',
      probability: 'Common',
      solution: 'Medical evaluation, kidney function tests, possibly 24-hour urine collection.',
      urgency: 'Moderate'
    },
    {
      condition: 'Kidney Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, kidney function tests, appropriate treatment based on diagnosis.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Diabetes',
      probability: 'Possible',
      solution: 'Blood glucose testing, diet management, exercise, medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'High Blood Pressure',
      probability: 'Possible',
      solution: 'Blood pressure monitoring, lifestyle modifications, medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Rapid Urination',
      probability: 'Common',
      solution: 'Usually normal, especially first morning urination. Increase water intake if concerned.',
      urgency: 'Low'
    }
  ],
  
  'Foul-Smelling Urine': [
    {
      condition: 'Urinary Tract Infection',
      probability: 'Very Common',
      solution: 'Medical evaluation, antibiotics if prescribed, increased fluid intake.',
      urgency: 'Moderate'
    },
    {
      condition: 'Dehydration',
      probability: 'Common',
      solution: 'Increased fluid intake, oral rehydration solutions.',
      urgency: 'Low'
    },
    {
      condition: 'Dietary Factors',
      probability: 'Common',
      solution: 'Dietary review (asparagus, certain vitamins, spicy foods), increased water intake.',
      urgency: 'Low'
    },
    {
      condition: 'Diabetes',
      probability: 'Possible',
      solution: 'Blood glucose testing, diet management, exercise, medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sexually Transmitted Infection',
      probability: 'Possible',
      solution: 'Medical evaluation, appropriate antibiotics or antivirals if diagnosed, safe sex practices.',
      urgency: 'Moderate'
    }
  ],
  
  Bedwetting: [
    {
      condition: 'Sleep Disorders',
      probability: 'Common',
      solution: 'Limit fluids before bed, scheduled bathroom trips, possibly bedwetting alarm.',
      urgency: 'Low'
    },
    {
      condition: 'Urinary Tract Infection',
      probability: 'Common',
      solution: 'Medical evaluation, antibiotics if prescribed, increased fluid intake during day.',
      urgency: 'Moderate'
    },
    {
      condition: 'Diabetes',
      probability: 'Possible',
      solution: 'Blood glucose testing, diet management, exercise, medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sleep Apnea',
      probability: 'Possible',
      solution: 'Sleep study, CPAP therapy if diagnosed, weight management if appropriate.',
      urgency: 'Moderate'
    },
    {
      condition: 'Psychological Stress',
      probability: 'Common (especially in children)',
      solution: 'Supportive environment, possibly counseling, stress management techniques.',
      urgency: 'Low'
    },
    {
      condition: 'Neurological Issues',
      probability: 'Less Common',
      solution: 'Medical evaluation, especially if new onset in adults or associated with other symptoms.',
      urgency: 'Moderate to High'
    }
  ],
  
  // REPRODUCTIVE SYMPTOMS
  'Sexual Dysfunction': [
    {
      condition: 'Psychological Factors',
      probability: 'Very Common',
      solution: 'Counseling or therapy, stress management, open communication with partner.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hormonal Imbalance',
      probability: 'Common',
      solution: 'Medical evaluation, hormone level testing, possibly hormone therapy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cardiovascular Disease',
      probability: 'Possible (especially in men with erectile dysfunction)',
      solution: 'Cardiovascular evaluation, lifestyle modifications, medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Diabetes',
      probability: 'Common',
      solution: 'Blood glucose management, regular exercise, possibly medications.',
      urgency: 'Moderate'
    }
  ],
  
  'Irregular Periods': [
    {
      condition: 'Hormonal Fluctuations',
      probability: 'Very Common',
      solution: 'Track cycle, maintain healthy weight, manage stress, consider hormonal contraceptives.',
      urgency: 'Low'
    },
    {
      condition: 'Polycystic Ovary Syndrome',
      probability: 'Common',
      solution: 'Medical evaluation, weight management, possibly hormonal medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Thyroid Disorders',
      probability: 'Common',
      solution: 'Thyroid function tests, appropriate medication if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Perimenopause',
      probability: 'Common (in women 40+)',
      solution: 'Hormonal management if needed, healthy lifestyle, possibly hormone therapy.',
      urgency: 'Low'
    },
    {
      condition: 'Stress',
      probability: 'Very Common',
      solution: 'Stress management techniques, regular exercise, adequate sleep.',
      urgency: 'Low'
    },
    {
      condition: 'Extreme Weight Changes',
      probability: 'Common',
      solution: 'Stabilize weight, nutritional counseling if needed, regular meals.',
      urgency: 'Moderate'
    }
  ],
  
  'Breast Pain': [
    {
      condition: 'Hormonal Changes',
      probability: 'Very Common',
      solution: 'Well-fitting supportive bra, over-the-counter pain relievers, warm compress.',
      urgency: 'Low'
    },
    {
      condition: 'Fibrocystic Changes',
      probability: 'Common',
      solution: 'Reduce caffeine, over-the-counter pain relievers, warm compress.',
      urgency: 'Low'
    },
    {
      condition: 'Mastitis',
      probability: 'Common (in breastfeeding women)',
      solution: 'Medical evaluation, antibiotics if bacterial, continued breastfeeding, cold/warm compresses.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cysts',
      probability: 'Common',
      solution: 'Medical evaluation, possibly drainage if large and painful.',
      urgency: 'Moderate'
    },
    {
      condition: 'Breast Cancer',
      probability: 'Less Common',
      solution: 'Medical evaluation if pain is persistent, localized, or associated with a lump.',
      urgency: 'High'
    }
  ],
  
  'Menstrual Cramps': [
    {
      condition: 'Primary Dysmenorrhea',
      probability: 'Very Common',
      solution: 'Over-the-counter pain relievers, heat therapy, gentle exercise, relaxation techniques.',
      urgency: 'Low'
    },
    {
      condition: 'Endometriosis',
      probability: 'Possible',
      solution: 'Medical evaluation, hormonal therapies, pain management, possibly laparoscopy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Uterine Fibroids',
      probability: 'Common',
      solution: 'Medical evaluation, hormonal therapies, pain management, possibly procedures.',
      urgency: 'Moderate'
    },
    {
      condition: 'Adenomyosis',
      probability: 'Possible',
      solution: 'Medical evaluation, hormonal therapies, pain management, possibly procedures.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pelvic Inflammatory Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotics if diagnosed, pain management.',
      urgency: 'High'
    }
  ],
  
  'Vaginal Discharge': [
    {
      condition: 'Normal Physiological Discharge',
      probability: 'Very Common',
      solution: 'Good hygiene, cotton underwear, avoid douches and scented products.',
      urgency: 'Low'
    },
    {
      condition: 'Bacterial Vaginosis',
      probability: 'Common',
      solution: 'Medical evaluation, antibiotics if diagnosed, probiotics, proper hygiene.',
      urgency: 'Moderate'
    },
    {
      condition: 'Yeast Infection',
      probability: 'Common',
      solution: 'Over-the-counter antifungal treatments, medical evaluation if recurrent.',
      urgency: 'Low'
    },
    {
      condition: 'Sexually Transmitted Infection',
      probability: 'Possible',
      solution: 'Medical evaluation, appropriate antibiotics or antivirals if diagnosed, safe sex practices.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cervical Cancer',
      probability: 'Less Common',
      solution: 'Medical evaluation, especially if bloody discharge or post-menopausal.',
      urgency: 'High'
    }
  ],
  
  'Vaginal Itching': [
    {
      condition: 'Yeast Infection',
      probability: 'Very Common',
      solution: 'Over-the-counter antifungal treatments, medical evaluation if recurrent.',
      urgency: 'Low'
    },
    {
      condition: 'Bacterial Vaginosis',
      probability: 'Common',
      solution: 'Medical evaluation, antibiotics if diagnosed, probiotics, proper hygiene.',
      urgency: 'Moderate'
    },
    {
      condition: 'Contact Dermatitis',
      probability: 'Common',
      solution: 'Avoid irritants (soaps, detergents, fabrics), wear cotton underwear, avoid tight clothing.',
      urgency: 'Low'
    },
    {
      condition: 'Sexually Transmitted Infection',
      probability: 'Possible',
      solution: 'Medical evaluation, appropriate antibiotics or antivirals if diagnosed, safe sex practices.',
      urgency: 'Moderate'
    },
    {
      condition: 'Menopause-Related Changes',
      probability: 'Common (in perimenopausal/menopausal women)',
      solution: 'Vaginal moisturizers, possibly topical estrogen if prescribed, avoid irritants.',
      urgency: 'Low'
    }
  ],
  
  'Testicular Pain': [
    {
      condition: 'Testicular Torsion',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY - this is a time-sensitive emergency.',
      urgency: 'Critical'
    },
    {
      condition: 'Epididymitis',
      probability: 'Common',
      solution: 'Medical evaluation, antibiotics if bacterial, rest, scrotal support, pain relievers.',
      urgency: 'High'
    },
    {
      condition: 'Orchitis',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotics if bacterial, rest, scrotal support, pain relievers.',
      urgency: 'High'
    },
    {
      condition: 'Inguinal Hernia',
      probability: 'Common',
      solution: 'Medical evaluation, possibly surgical repair, avoid heavy lifting.',
      urgency: 'Moderate'
    },
    {
      condition: 'Kidney Stones',
      probability: 'Possible',
      solution: 'Medical evaluation, pain management, increased fluid intake.',
      urgency: 'High'
    }
  ],
  
  'Genital Sores': [
    {
      condition: 'Herpes Simplex Virus',
      probability: 'Common',
      solution: 'Medical evaluation, antiviral medications, pain management, safe sex practices.',
      urgency: 'Moderate'
    },
    {
      condition: 'Syphilis',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotic treatment, partner notification and testing.',
      urgency: 'High'
    },
    {
      condition: 'Genital Warts',
      probability: 'Common',
      solution: 'Medical evaluation, various treatment options (topical, cryotherapy, etc.), safe sex practices.',
      urgency: 'Moderate'
    },
    {
      condition: 'Chancroid',
      probability: 'Less Common',
      solution: 'Medical evaluation, antibiotic treatment, proper hygiene, safe sex practices.',
      urgency: 'Moderate'
    },
    {
      condition: 'Contact Dermatitis',
      probability: 'Common',
      solution: 'Avoid irritants, topical hydrocortisone if not infected, keep area clean and dry.',
      urgency: 'Low'
    }
  ],
  
  // ORAL SYMPTOMS
  'Mouth Ulcers': [
    {
      condition: 'Canker Sores',
      probability: 'Very Common',
      solution: 'Avoid spicy or acidic foods, over-the-counter numbing gels, salt water rinses.',
      urgency: 'Low'
    },
    {
      condition: 'Vitamin Deficiencies',
      probability: 'Common',
      solution: 'Balanced diet, supplements if deficient (especially B vitamins, iron, zinc).',
      urgency: 'Low'
    },
    {
      condition: 'Oral Herpes',
      probability: 'Common',
      solution: 'Antiviral medications if severe, avoid triggers, over-the-counter cold sore treatments.',
      urgency: 'Low'
    },
    {
      condition: 'Stress',
      probability: 'Common',
      solution: 'Stress management techniques, adequate sleep, regular exercise.',
      urgency: 'Low'
    },
    {
      condition: 'Autoimmune Disorders',
      probability: 'Less Common',
      solution: 'Medical evaluation if ulcers are persistent, large, or numerous.',
      urgency: 'Moderate'
    }
  ],
  
  'Bad Breath': [
    {
      condition: 'Poor Oral Hygiene',
      probability: 'Very Common',
      solution: 'Regular brushing and flossing, tongue cleaning, professional dental cleanings.',
      urgency: 'Low'
    },
    {
      condition: 'Gum Disease',
      probability: 'Common',
      solution: 'Professional dental care, improved oral hygiene, possibly antibiotics or procedures.',
      urgency: 'Moderate'
    },
    {
      condition: 'Dry Mouth',
      probability: 'Common',
      solution: 'Stay hydrated, artificial saliva products, sugar-free gum, address underlying causes.',
      urgency: 'Low'
    },
    {
      condition: 'Sinus Infections',
      probability: 'Common',
      solution: 'Treat underlying infection, nasal irrigation, decongestants if recommended.',
      urgency: 'Moderate'
    },
    {
      condition: 'Digestive Issues',
      probability: 'Possible',
      solution: 'Dietary changes, avoid trigger foods, possibly medications for acid reflux if diagnosed.',
      urgency: 'Moderate'
    }
  ],
  
  'Gum Bleeding': [
    {
      condition: 'Gingivitis',
      probability: 'Very Common',
      solution: 'Improved oral hygiene, regular dental cleanings, antimicrobial mouth rinses.',
      urgency: 'Moderate'
    },
    {
      condition: 'Periodontitis',
      probability: 'Common',
      solution: 'Professional dental treatment, improved oral hygiene, possibly antibiotics.',
      urgency: 'Moderate'
    },
    {
      condition: 'Vitamin C Deficiency',
      probability: 'Possible',
      solution: 'Vitamin C-rich foods or supplements, balanced diet.',
      urgency: 'Low'
    },
    {
      condition: 'Blood Thinning Medications',
      probability: 'Common (in those taking them)',
      solution: 'Gentle brushing, soft toothbrush, regular dental care, inform dentist of medications.',
      urgency: 'Low'
    },
    {
      condition: 'Pregnancy Gingivitis',
      probability: 'Common (in pregnant women)',
      solution: 'Improved oral hygiene, regular dental care, will often improve after pregnancy.',
      urgency: 'Low'
    }
  ],
  
  'Bleeding Gums': [
    {
      condition: 'Gingivitis',
      probability: 'Very Common',
      solution: 'Improved oral hygiene, regular dental cleanings, antimicrobial mouth rinses.',
      urgency: 'Moderate'
    },
    {
      condition: 'Periodontitis',
      probability: 'Common',
      solution: 'Professional dental treatment, improved oral hygiene, possibly antibiotics.',
      urgency: 'Moderate'
    },
    {
      condition: 'Vitamin K Deficiency',
      probability: 'Possible',
      solution: 'Vitamin K-rich foods or supplements, balanced diet.',
      urgency: 'Low'
    },
    {
      condition: 'Blood Thinning Medications',
      probability: 'Common (in those taking them)',
      solution: 'Gentle brushing, soft toothbrush, regular dental care, inform dentist of medications.',
      urgency: 'Low'
    },
    {
      condition: 'Bleeding Disorders',
      probability: 'Less Common',
      solution: 'Medical evaluation if bleeding is severe, persistent, or accompanied by other symptoms.',
      urgency: 'Moderate to High'
    }
  ],
  
  Toothache: [
    {
      condition: 'Dental Cavity',
      probability: 'Very Common',
      solution: 'Dental evaluation, filling or other treatment, over-the-counter pain relievers temporarily.',
      urgency: 'Moderate'
    },
    {
      condition: 'Dental Abscess',
      probability: 'Common',
      solution: 'SEEK DENTAL CARE PROMPTLY, antibiotics if prescribed, root canal or extraction may be needed.',
      urgency: 'High'
    },
    {
      condition: 'Gum Disease',
      probability: 'Common',
      solution: 'Professional dental treatment, improved oral hygiene, possibly antibiotics.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cracked Tooth',
      probability: 'Common',
      solution: 'Dental evaluation, possible crown, bonding, or extraction depending on severity.',
      urgency: 'Moderate'
    },
    {
      condition: 'Teeth Grinding',
      probability: 'Common',
      solution: 'Night guard, stress management, jaw exercises, dental evaluation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sinus Infection',
      probability: 'Possible',
      solution: 'Treat underlying sinus infection, decongestants, pain relievers.',
      urgency: 'Moderate'
    }
  ],
  
  // DIGESTIVE SYMPTOMS (continuation)
  'Difficulty Swallowing': [
    {
      condition: 'Gastroesophageal Reflux Disease',
      probability: 'Common',
      solution: 'Diet modifications, avoid eating before bedtime, elevation of head while sleeping, medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Relaxation techniques, small bites, chew thoroughly, stay hydrated, possibly counseling.',
      urgency: 'Low'
    },
    {
      condition: 'Esophagitis',
      probability: 'Possible',
      solution: 'Medical evaluation, medications to reduce.',
      urgency: 'High'
    }
  ],
      
      'Itchy Ears': [
    {
      condition: 'Dry Skin',
      probability: 'Common',
      solution: 'Avoid inserting objects, mild mineral oil or prescribed ear drops, avoid harsh soaps.',
      urgency: 'Low'
    },
    {
      condition: 'Allergic Reaction',
      probability: 'Common',
      solution: 'Identify and avoid allergens, antihistamines, prescribed ear drops if needed.',
      urgency: 'Low'
    },
    {
      condition: 'Ear Infection',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotics if bacterial, antifungals if fungal, keep ear dry.',
      urgency: 'Moderate'
    },
    {
      condition: 'Eczema',
      probability: 'Common',
      solution: 'Prescribed steroid drops or creams, keep area clean and dry, avoid irritants.',
      urgency: 'Low'
    },
    {
      condition: 'Ear Wax Issues',
      probability: 'Common',
      solution: 'Proper ear cleaning by healthcare professional, avoid cotton swabs.',
      urgency: 'Low'
    }
  ],
  
  // URINARY SYMPTOMS
  'Frequent Urination': [
    {
      condition: 'Urinary Tract Infection',
      probability: 'Very Common',
      solution: 'Increased fluid intake, antibiotics if prescribed, cranberry supplements or juice.',
      urgency: 'Moderate'
    },
    {
      condition: 'Diabetes',
      probability: 'Common',
      solution: 'Blood glucose testing, diet management, exercise, medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Overactive Bladder',
      probability: 'Common',
      solution: 'Bladder training, scheduled voiding, pelvic floor exercises, possibly medication.',
      urgency: 'Low'
    },
    {
      condition: 'Enlarged Prostate (men)',
      probability: 'Very Common (in older men)',
      solution: 'Medical evaluation, possibly medications or procedures, limit fluids before bedtime.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pregnancy (women)',
      probability: 'Common (in pregnant women)',
      solution: 'Scheduled voiding, pelvic floor exercises, maintain hydration while limiting evening fluids.',
      urgency: 'Low'
    },
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Stress management techniques, possibly therapy or counseling.',
      urgency: 'Low'
    }
  ],
  
  'Painful Urination': [
    {
      condition: 'Urinary Tract Infection',
      probability: 'Very Common',
      solution: 'Increased fluid intake, antibiotics if prescribed, cranberry supplements or juice.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sexually Transmitted Infection',
      probability: 'Common',
      solution: 'Medical evaluation, appropriate antibiotics or antivirals if diagnosed, safe sex practices.',
      urgency: 'Moderate'
    },
    {
      condition: 'Interstitial Cystitis',
      probability: 'Possible',
      solution: 'Dietary modifications, pelvic floor physical therapy, medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Kidney Stones',
      probability: 'Possible',
      solution: 'Increased fluid intake, pain management, medical evaluation, possibly procedures.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Prostatitis (men)',
      probability: 'Common (in men)',
      solution: 'Antibiotics if bacterial, anti-inflammatories, warm baths, increased fluid intake.',
      urgency: '// Additional condition mappings to complement existing ones'
    }
  ],

  // MUSCULOSKELETAL SYMPTOMS
  'Muscle Pain': [
    {
      condition: 'Muscle Strain',
      probability: 'Very Common',
      solution: 'Rest, ice for first 48 hours then heat, gentle stretching, over-the-counter pain relievers.',
      urgency: 'Low'
    },
    {
      condition: 'Fibromyalgia',
      probability: 'Possible',
      solution: 'Regular exercise, stress management, good sleep hygiene, prescribed medications if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Viral Infection',
      probability: 'Common',
      solution: 'Rest, adequate hydration, over-the-counter pain relievers, warm baths.',
      urgency: 'Low'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common (especially statins)',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Vitamin D Deficiency',
      probability: 'Common',
      solution: 'Blood tests to confirm, vitamin D supplements if deficient, increased sun exposure.',
      urgency: 'Low'
    }
  ],
  
  'Joint Pain': [
    {
      condition: 'Osteoarthritis',
      probability: 'Common',
      solution: 'Regular low-impact exercise, weight management, over-the-counter pain relievers, joint protection.',
      urgency: 'Low'
    },
    {
      condition: 'Rheumatoid Arthritis',
      probability: 'Possible',
      solution: 'Medical evaluation, anti-inflammatory medications, disease-modifying antirheumatic drugs if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Gout',
      probability: 'Possible',
      solution: 'Dietary changes to avoid purine-rich foods, increase water intake, medication if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Lupus',
      probability: 'Less Common',
      solution: 'Medical evaluation, sun protection, anti-inflammatory medications, immunosuppressants if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Lyme Disease',
      probability: 'Possible (in endemic areas)',
      solution: 'Medical evaluation, antibiotics if diagnosed, rest and supportive care.',
      urgency: 'Moderate'
    }
  ],
  
  'Neck Pain': [
    {
      condition: 'Muscle Strain',
      probability: 'Very Common',
      solution: 'Rest, gentle stretching, proper ergonomics, over-the-counter pain relievers.',
      urgency: 'Low'
    },
    {
      condition: 'Cervical Spondylosis',
      probability: 'Common (especially in older adults)',
      solution: 'Physical therapy, proper posture, pain management, heat or cold therapy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Herniated Disc',
      probability: 'Possible',
      solution: 'Rest, physical therapy, pain management, possible steroid injections if severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Whiplash',
      probability: 'Possible (after trauma)',
      solution: 'Rest, ice in first 24 hours, gentle movement as tolerated, physical therapy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Meningitis',
      probability: 'Rare',
      solution: 'SEEK EMERGENCY CARE if neck pain is accompanied by fever, headache, and stiff neck.',
      urgency: 'Critical'
    }
  ],
  
  'Shoulder Pain': [
    {
      condition: 'Rotator Cuff Injury',
      probability: 'Common',
      solution: 'Rest, ice, physical therapy, anti-inflammatory medications, possible surgery if severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Frozen Shoulder',
      probability: 'Possible',
      solution: 'Physical therapy, range-of-motion exercises, pain management, steroid injections if severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Bursitis',
      probability: 'Common',
      solution: 'Rest, ice, anti-inflammatory medications, physical therapy, corticosteroid injections if severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Arthritis',
      probability: 'Common (especially in older adults)',
      solution: 'Pain management, physical therapy, activity modification, joint-protecting techniques.',
      urgency: 'Moderate'
    },
    {
      condition: 'Heart Attack (referred pain)',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE if left shoulder pain is accompanied by chest pain, shortness of breath, or sweating.',
      urgency: 'Critical'
    }
  ],
  
  'Knee Pain': [
    {
      condition: 'Osteoarthritis',
      probability: 'Common (especially in older adults)',
      solution: 'Weight management, low-impact exercise, physical therapy, pain relievers, knee braces.',
      urgency: 'Moderate'
    },
    {
      condition: 'Ligament Injury',
      probability: 'Common (especially after trauma)',
      solution: 'RICE (Rest, Ice, Compression, Elevation), physical therapy, possible surgery if severe.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Meniscus Tear',
      probability: 'Common',
      solution: 'RICE, anti-inflammatory medications, physical therapy, possible surgery if severe.',
      urgency: 'Moderate'
    },
    {
      condition: 'Patellar Tendinitis',
      probability: 'Common (in athletes)',
      solution: 'Rest from aggravating activities, ice, physical therapy, proper warmup and strengthening.',
      urgency: 'Low'
    },
    {
      condition: 'Bursitis',
      probability: 'Common',
      solution: 'Rest, ice, anti-inflammatory medications, activity modification.',
      urgency: 'Low'
    }
  ],
  
  'Ankle Pain': [
    {
      condition: 'Sprain',
      probability: 'Very Common',
      solution: 'RICE (Rest, Ice, Compression, Elevation), anti-inflammatory medications, gradual return to activity.',
      urgency: 'Moderate'
    },
    {
      condition: 'Tendinitis',
      probability: 'Common',
      solution: 'Rest, ice, anti-inflammatory medications, supportive footwear, physical therapy.',
      urgency: 'Low'
    },
    {
      condition: 'Fracture',
      probability: 'Possible (especially after trauma)',
      solution: 'SEEK MEDICAL CARE if unable to bear weight, severe pain, or visible deformity.',
      urgency: 'High'
    },
    {
      condition: 'Arthritis',
      probability: 'Common (especially in older adults)',
      solution: 'Pain management, physical therapy, appropriate footwear, possible bracing.',
      urgency: 'Moderate'
    },
    {
      condition: 'Gout',
      probability: 'Possible',
      solution: 'Anti-inflammatory medications, dietary changes, increased water intake, medication if prescribed.',
      urgency: 'Moderate'
    }
  ],
  
  'Hip Pain': [
    {
      condition: 'Osteoarthritis',
      probability: 'Common (especially in older adults)',
      solution: 'Weight management, low-impact exercise, physical therapy, pain relievers.',
      urgency: 'Moderate'
    },
    {
      condition: 'Bursitis',
      probability: 'Common',
      solution: 'Rest, ice, anti-inflammatory medications, activity modification, physical therapy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hip Fracture',
      probability: 'Possible (especially in elderly)',
      solution: 'SEEK EMERGENCY CARE if unable to bear weight or severe pain after a fall.',
      urgency: 'Critical'
    },
    {
      condition: 'Sciatica',
      probability: 'Common',
      solution: 'Pain management, physical therapy, proper posture and body mechanics.',
      urgency: 'Moderate'
    },
    {
      condition: 'Muscle Strain',
      probability: 'Common',
      solution: 'Rest, ice, gentle stretching, over-the-counter pain relievers.',
      urgency: 'Low'
    }
  ],
  
  'Wrist Pain': [
    {
      condition: 'Carpal Tunnel Syndrome',
      probability: 'Common',
      solution: 'Wrist splints, ergonomic adjustments, physical therapy, anti-inflammatory medications.',
      urgency: 'Moderate'
    },
    {
      condition: 'Tendinitis',
      probability: 'Common',
      solution: 'Rest, ice, anti-inflammatory medications, activity modification, physical therapy.',
      urgency: 'Low'
    },
    {
      condition: 'Arthritis',
      probability: 'Common',
      solution: 'Anti-inflammatory medications, splints, joint protection techniques, heat therapy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Fracture',
      probability: 'Possible (especially after trauma)',
      solution: 'SEEK MEDICAL CARE if severe pain, swelling, or visible deformity after injury.',
      urgency: 'High'
    },
    {
      condition: 'Ganglion Cyst',
      probability: 'Common',
      solution: 'Observation if asymptomatic, aspiration or surgical removal if painful or limiting function.',
      urgency: 'Low'
    }
  ],
  
  Stiffness: [
    {
      condition: 'Arthritis',
      probability: 'Common',
      solution: 'Gentle movement, warm showers/baths, anti-inflammatory medications, physical therapy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Muscle Tension',
      probability: 'Very Common',
      solution: 'Gentle stretching, regular exercise, stress management, massage, warm baths.',
      urgency: 'Low'
    },
    {
      condition: 'Fibromyalgia',
      probability: 'Possible',
      solution: 'Regular gentle exercise, stress management, good sleep hygiene, prescribed medications if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Parkinsons Disease',
      probability: 'Possible (especially in older adults)',
      solution: 'Medical evaluation, prescribed medications, physical therapy, regular exercise.',
      urgency: 'Moderate'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    }
  ],
  
  'Swollen Joints': [
    {
      condition: 'Rheumatoid Arthritis',
      probability: 'Common',
      solution: 'Medical evaluation, anti-inflammatory medications, disease-modifying antirheumatic drugs if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Osteoarthritis',
      probability: 'Common',
      solution: 'Anti-inflammatory medications, ice, joint protection techniques, physical therapy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Gout',
      probability: 'Common',
      solution: 'Anti-inflammatory medications, dietary changes, increased water intake, medication if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Lupus',
      probability: 'Less Common',
      solution: 'Medical evaluation, sun protection, anti-inflammatory medications, immunosuppressants if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Infection',
      probability: 'Possible',
      solution: 'SEEK MEDICAL CARE if joint is red, hot, and severely painful, especially with fever.',
      urgency: 'High'
    }
  ],
  
  'Muscle Cramping': [
    {
      condition: 'Dehydration',
      probability: 'Very Common',
      solution: 'Increase fluid intake, consider electrolyte beverages, gentle stretching.',
      urgency: 'Low'
    },
    {
      condition: 'Electrolyte Imbalance',
      probability: 'Common',
      solution: 'Balanced diet with adequate minerals, possibly supplements if deficient.',
      urgency: 'Low'
    },
    {
      condition: 'Overexertion',
      probability: 'Common',
      solution: 'Rest, gentle stretching, proper warmup and cooldown during exercise.',
      urgency: 'Low'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Peripheral Artery Disease',
      probability: 'Possible (especially in older adults)',
      solution: 'Medical evaluation, exercise program, smoking cessation, possibly medication.',
      urgency: 'Moderate'
    }
  ],
  
  // SKIN SYMPTOMS
  Rash: [
    {
      condition: 'Contact Dermatitis',
      probability: 'Common',
      solution: 'Identify and avoid trigger, apply calamine lotion, take antihistamines, use cool compresses.',
      urgency: 'Low'
    },
    {
      condition: 'Eczema',
      probability: 'Common',
      solution: 'Moisturize regularly, avoid triggers, topical corticosteroids, antihistamines for itching.',
      urgency: 'Low'
    },
    {
      condition: 'Psoriasis',
      probability: 'Possible',
      solution: 'Topical treatments, light therapy, systemic medications for severe cases.',
      urgency: 'Low'
    },
    {
      condition: 'Hives',
      probability: 'Possible',
      solution: 'Antihistamines, identify and avoid triggers, cool baths, loose clothing.',
      urgency: 'Moderate'
    },
    {
      condition: 'Chickenpox',
      probability: 'Possible',
      solution: 'Calamine lotion, antihistamines, oatmeal baths, avoid scratching, isolate until no new lesions.',
      urgency: 'Moderate'
    },
    {
      condition: 'Shingles',
      probability: 'Possible',
      solution: 'Antiviral medications (most effective if started early), pain management, cool compresses.',
      urgency: 'Moderate'
    }

  ],
  
  Itching: [
    {
      condition: 'Dry Skin',
      probability: 'Very Common',
      solution: 'Moisturize regularly, use gentle soaps, avoid hot showers, consider humidifier in dry environments.',
      urgency: 'Low'
    },
    {
      condition: 'Allergic Reaction',
      probability: 'Common',
      solution: 'Identify and avoid triggers, take antihistamines, use anti-itch creams, consider cool baths.',
      urgency: 'Low to Moderate'
    },
    {
      condition: 'Eczema',
      probability: 'Common',
      solution: 'Moisturize regularly, avoid triggers, topical corticosteroids if prescribed, keep nails short.',
      urgency: 'Low'
    },
    {
      condition: 'Psoriasis',
      probability: 'Possible',
      solution: 'Moisturize regularly, medicated creams if prescribed, light therapy if recommended.',
      urgency: 'Moderate'
    },
    {
      condition: 'Scabies',
      probability: 'Possible',
      solution: 'See doctor for prescription scabicide, wash all clothing and bedding in hot water.',
      urgency: 'Moderate'
    },
    {
      condition: 'Fungal Infection',
      probability: 'Common',
      solution: 'Keep area clean and dry, over-the-counter antifungal medication, see doctor if persistent.',
      urgency: 'Low'
    }
  ],
  
  'Dry Skin': [
    {
      condition: 'Environmental Factors',
      probability: 'Very Common',
      solution: 'Moisturize regularly, use gentle soaps, avoid hot showers, use humidifier in dry environments.',
      urgency: 'Low'
    },
    {
      condition: 'Eczema',
      probability: 'Common',
      solution: 'Moisturize regularly, avoid triggers, topical corticosteroids if prescribed.',
      urgency: 'Low'
    },
    {
      condition: 'Psoriasis',
      probability: 'Possible',
      solution: 'Moisturize regularly, medicated creams if prescribed, light therapy if recommended.',
      urgency: 'Moderate'
    },
    {
      condition: 'Hypothyroidism',
      probability: 'Possible',
      solution: 'Medical evaluation, thyroid function tests, thyroid hormone replacement if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Dehydration',
      probability: 'Common',
      solution: 'Increase water intake, limit alcohol and caffeine consumption, eat hydrating foods.',
      urgency: 'Low'
    }
  ],
  
  'Hair Loss': [
    {
      condition: 'Male/Female Pattern Baldness',
      probability: 'Very Common',
      solution: 'Minoxidil, finasteride (men only), PRP treatments, hair transplant if desired.',
      urgency: 'Low'
    },
    {
      condition: 'Stress-Related Shedding',
      probability: 'Common',
      solution: 'Stress management, adequate sleep, healthy diet, usually resolves with time.',
      urgency: 'Low'
    },
    {
      condition: 'Thyroid Disorders',
      probability: 'Possible',
      solution: 'Medical evaluation, thyroid function tests, appropriate treatment based on diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Nutritional Deficiencies',
      probability: 'Possible',
      solution: 'Balanced diet, supplements if deficient (iron, vitamin D, biotin), blood tests to confirm.',
      urgency: 'Low'
    },
    {
      condition: 'Alopecia Areata',
      probability: 'Less Common',
      solution: 'Dermatologist evaluation, topical or injectable corticosteroids, immunotherapy if recommended.',
      urgency: 'Moderate'
    }
  ],
  
  'Excessive Sweating': [
    {
      condition: 'Hyperhidrosis',
      probability: 'Common',
      solution: 'Clinical-strength antiperspirants, prescription medications, specialized treatments if severe.',
      urgency: 'Low'
    },
    {
      condition: 'Anxiety',
      probability: 'Common',
      solution: 'Stress management techniques, therapy or counseling, possibly medication.',
      urgency: 'Low'
    },
    {
      condition: 'Hyperthyroidism',
      probability: 'Possible',
      solution: 'Medical evaluation, thyroid function tests, appropriate treatment if diagnosed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Infection',
      probability: 'Possible',
      solution: 'Medical evaluation if sweating is accompanied by fever, particularly night sweats.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    }
  ],
  
  Hives: [
    {
      condition: 'Allergic Reaction',
      probability: 'Very Common',
      solution: 'Identify and avoid triggers, take antihistamines, use cool compresses, seek emergency care if breathing affected.',
      urgency: 'Low to Critical (depending on severity)'
    },
    {
      condition: 'Stress',
      probability: 'Common',
      solution: 'Stress management techniques, relaxation practices, adequate sleep.',
      urgency: 'Low'
    },
    {
      condition: 'Heat or Cold Exposure',
      probability: 'Common',
      solution: 'Avoid extreme temperatures, dress appropriately, take antihistamines if needed.',
      urgency: 'Low'
    },
    {
      condition: 'Infection',
      probability: 'Possible',
      solution: 'Treat underlying infection, antihistamines for symptomatic relief.',
      urgency: 'Moderate'
    },
    {
      condition: 'Chronic Urticaria',
      probability: 'Possible',
      solution: 'Allergy specialist evaluation, antihistamines, possibly other medications if persistent.',
      urgency: 'Moderate'
    }
  ],
  
  'Bruising Easily': [
    {
      condition: 'Age-Related Changes',
      probability: 'Common (especially in elderly)',
      solution: 'Protect vulnerable areas, ensure safe environment to prevent bumps and falls.',
      urgency: 'Low'
    },
    {
      condition: 'Blood-Thinning Medications',
      probability: 'Common (in those taking them)',
      solution: 'Use caution to avoid injuries, medical review of medications if concerned.',
      urgency: 'Low'
    },
    {
      condition: 'Vitamin K Deficiency',
      probability: 'Possible',
      solution: 'Include vitamin K-rich foods in diet (leafy greens, broccoli), possibly supplements.',
      urgency: 'Low'
    },
    {
      condition: 'Liver Disease',
      probability: 'Possible',
      solution: 'Medical evaluation, liver function tests, appropriate treatment based on diagnosis.',
      urgency: 'Moderate'
    },
    {
      condition: 'Blood Disorders',
      probability: 'Less Common',
      solution: 'Medical evaluation, blood tests, appropriate treatment based on diagnosis.',
      urgency: 'Moderate to High'
    }
  ],
  
  'Skin Ulcers': [
    {
      condition: 'Venous Insufficiency',
      probability: 'Common',
      solution: 'Elevation, compression stockings, wound care, possibly medications or procedures.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pressure Ulcers',
      probability: 'Common (in bedridden individuals)',
      solution: 'Regular repositioning, specialized mattresses or cushions, meticulous skin care.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Diabetes',
      probability: 'Common (in diabetics)',
      solution: 'Blood sugar control, proper foot care, regular medical monitoring, prompt treatment of wounds.',
      urgency: 'High'
    },
    {
      condition: 'Arterial Insufficiency',
      probability: 'Possible',
      solution: 'Medical evaluation, vascular studies, possible procedures to improve circulation.',
      urgency: 'High'
    },
    {
      condition: 'Infection',
      probability: 'Possible',
      solution: 'Wound care, antibiotics if infected, debridement if necessary.',
      urgency: 'High'
    }
  ],
  
  // EYE SYMPTOMS
  'Blur of Vision': [
    {
      condition: 'Refractive Error',
      probability: 'Very Common',
      solution: 'Eye examination for proper prescription glasses or contact lenses.',
      urgency: 'Low'
    },
    {
      condition: 'Cataracts',
      probability: 'Common (especially in older adults)',
      solution: 'Regular eye exams, surgery when vision significantly affected, proper lighting.',
      urgency: 'Low to Moderate'
    },
    {
      condition: 'Diabetic Retinopathy',
      probability: 'Possible',
      solution: 'Regular eye exams, tight blood sugar control, possible laser treatment or surgery.',
      urgency: 'Moderate to High'
    },
    {
      condition: 'Glaucoma',
      probability: 'Possible',
      solution: 'Regular eye exams, prescription eye drops, sometimes surgery or laser treatment.',
      urgency: 'Moderate'
    },
    {
      condition: 'Macular Degeneration',
      probability: 'Possible (especially in older adults)',
      solution: 'Regular eye exams, nutritional supplements, possible injections or laser therapy.',
      urgency: 'Moderate'
    },
    {
      condition: 'Stroke',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY if sudden vision changes, especially with other symptoms.',
      urgency: 'Critical'
    }
  ],
  
  'Eye Pain': [
    {
      condition: 'Dry Eyes',
      probability: 'Very Common',
      solution: 'Artificial tears, humidifier, avoid eye strain, proper blinking during screen use.',
      urgency: 'Low'
    },
    {
      condition: 'Conjunctivitis',
      probability: 'Common',
      solution: 'Warm compresses, artificial tears, antibiotics if bacterial, avoid touching eyes.',
      urgency: 'Low'
    },
    {
      condition: 'Corneal Abrasion',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotic eye drops if prescribed, eye protection if recommended.',
      urgency: 'Moderate'
    },
    {
      condition: 'Glaucoma',
      probability: 'Possible',
      solution: 'SEEK IMMEDIATE MEDICAL CARE for sudden severe eye pain, especially with nausea or vomiting.',
      urgency: 'High to Critical'
    },
    {
      condition: 'Migraine',
      probability: 'Common',
      solution: 'Rest in dark room, migraine medications if prescribed, identify and avoid triggers.',
      urgency: 'Moderate'
    },
    {
      condition: 'Foreign Body',
      probability: 'Common',
      solution: 'Flush with clean water, do not rub eye, seek medical care if unable to remove or pain persists.',
      urgency: 'Moderate'
    }
  ],
  
  'Eye Discharge': [
    {
      condition: 'Conjunctivitis',
      probability: 'Very Common',
      solution: 'Warm compresses, artificial tears, antibiotics if bacterial, avoid touching eyes.',
      urgency: 'Low'
    },
    {
      condition: 'Allergies',
      probability: 'Common',
      solution: 'Avoid allergens, artificial tears, antihistamine eye drops, cool compresses.',
      urgency: 'Low'
    },
    {
      condition: 'Blocked Tear Duct',
      probability: 'Possible',
      solution: 'Warm compresses, gentle massage, medical evaluation if persistent.',
      urgency: 'Low'
    },
    {
      condition: 'Blepharitis',
      probability: 'Common',
      solution: 'Eyelid hygiene, warm compresses, possibly antibiotic ointment if prescribed.',
      urgency: 'Low'
    },
    {
      condition: 'Corneal Ulcer',
      probability: 'Less Common',
      solution: 'SEEK PROMPT MEDICAL CARE, especially if painful with decreased vision.',
      urgency: 'High'
    }
  ],
  
  'Eye Redness': [
    {
      condition: 'Dry Eyes',
      probability: 'Very Common',
      solution: 'Artificial tears, humidifier, avoid eye strain, proper blinking during screen use.',
      urgency: 'Low'
    },
    {
      condition: 'Conjunctivitis',
      probability: 'Common',
      solution: 'Warm compresses, artificial tears, antibiotics if bacterial, avoid touching eyes.',
      urgency: 'Low'
    },
    {
      condition: 'Allergies',
      probability: 'Common',
      solution: 'Avoid allergens, artificial tears, antihistamine eye drops, cool compresses.',
      urgency: 'Low'
    },
    {
      condition: 'Subconjunctival Hemorrhage',
      probability: 'Common',
      solution: 'No treatment needed, will resolve on its own, avoid straining or rubbing eyes.',
      urgency: 'Low'
    },
    {
      condition: 'Glaucoma',
      probability: 'Less Common',
      solution: 'SEEK IMMEDIATE MEDICAL CARE if accompanied by pain, nausea, or vision changes.',
      urgency: 'High'
    }
  ],
  
  'Swollen Eyelids': [
    {
      condition: 'Allergies',
      probability: 'Very Common',
      solution: 'Cold compresses, antihistamines, avoid allergens, artificial tears.',
      urgency: 'Low'
    },
    {
      condition: 'Stye',
      probability: 'Common',
      solution: 'Warm compresses several times daily, gentle eyelid cleaning, avoid eye makeup.',
      urgency: 'Low'
    },
    {
      condition: 'Chalazion',
      probability: 'Common',
      solution: 'Warm compresses, gentle massage, medical evaluation if persistent.',
      urgency: 'Low'
    },
    {
      condition: 'Conjunctivitis',
      probability: 'Common',
      solution: 'Warm compresses, artificial tears, antibiotics if bacterial, avoid touching eyes.',
      urgency: 'Low'
    },
    {
      condition: 'Cellulitis',
      probability: 'Less Common',
      solution: 'SEEK MEDICAL CARE, especially if rapidly worsening, painful, or with fever.',
      urgency: 'High'
    }
  ],
  
  'Double Vision': [
    {
      condition: 'Fatigue',
      probability: 'Common',
      solution: 'Rest, adequate sleep, reduced screen time, proper lighting for reading.',
      urgency: 'Low'
    },
    {
      condition: 'Stroke',
      probability: 'Possible',
      solution: 'SEEK EMERGENCY CARE IMMEDIATELY, especially if sudden onset with other symptoms.',
      urgency: 'Critical'
    },
    {
      condition: 'Multiple Sclerosis',
      probability: 'Possible',
      solution: 'Medical evaluation, MRI if recommended, neurologist referral.',
      urgency: 'High'
    },
    {
      condition: 'Myasthenia Gravis',
      probability: 'Less Common',
      solution: 'Medical evaluation, specialized blood tests, neurologist referral.',
      urgency: 'High'
    },
    {
      condition: 'Concussion',
      probability: 'Possible (after head injury)',
      solution: 'Medical evaluation, brain rest, gradual return to activities as directed.',
      urgency: 'High'
    }
  ],
  
  'Sensitivity to Light': [
    {
      condition: 'Migraine',
      probability: 'Common',
      solution: 'Rest in dark room, migraine medications if prescribed, identify and avoid triggers.',
      urgency: 'Moderate'
    },
    {
      condition: 'Corneal Abrasion',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotic eye drops if prescribed, eye protection if recommended.',
      urgency: 'Moderate'
    },
    {
      condition: 'Conjunctivitis',
      probability: 'Common',
      solution: 'Warm compresses, artificial tears, antibiotics if bacterial, avoid touching eyes.',
      urgency: 'Low'
    },
    {
      condition: 'Meningitis',
      probability: 'Rare',
      solution: 'SEEK EMERGENCY CARE if accompanied by fever, headache, and stiff neck.',
      urgency: 'Critical'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    }
  ],
  
  'Dry Eyes': [
    {
      condition: 'Environmental Factors',
      probability: 'Very Common',
      solution: 'Artificial tears, humidifier, avoid direct air flow, proper blinking during screen use.',
      urgency: 'Low'
    },
    {
      condition: 'Aging',
      probability: 'Common (especially in older adults)',
      solution: 'Artificial tears, prescription eye drops if needed, omega-3 supplements.',
      urgency: 'Low'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Low'
    },
    {
      condition: 'Autoimmune Disorders',
      probability: 'Possible',
      solution: 'Medical evaluation, prescription eye drops, possibly punctal plugs.',
      urgency: 'Moderate'
    },
    {
      condition: 'Prolonged Screen Use',
      probability: 'Very Common',
      solution: 'Follow 20-20-20 rule (look away every 20 minutes), proper blinking, workstation ergonomics.',
      urgency: 'Low'
    }
  ],
  
  // EAR SYMPTOMS
  'Hearing Loss': [
    {
      condition: 'Ear Wax Buildup',
      probability: 'Common',
      solution: 'Ear drops to soften wax, gentle irrigation, medical removal if needed, avoid cotton swabs.',
      urgency: 'Low'
    },
    {
      condition: 'Age-Related Hearing Loss',
      probability: 'Very Common (in older adults)',
      solution: 'Hearing evaluation, hearing aids if recommended, communication strategies.',
      urgency: 'Low'
    },
    {
      condition: 'Ear Infection',
      probability: 'Common',
      solution: 'Medical evaluation, antibiotics if bacterial, pain relievers, warm compress.',
      urgency: 'Moderate'
    },
    {
      condition: 'Noise-Induced Hearing Loss',
      probability: 'Common',
      solution: 'Hearing protection, avoid loud environments, hearing aids if recommended.',
      urgency: 'Low'
    },
    {
      condition: 'Ménières Disease',
      probability: 'Less Common',
      solution: 'Medical evaluation, salt restriction, diuretics or other medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sudden Sensorineural Hearing Loss',
      probability: 'Rare',
      solution: 'SEEK IMMEDIATE MEDICAL CARE - treatment most effective within 72 hours.',
      urgency: 'Critical'
    }
  ],
  
  Earache: [
    {
      condition: 'Ear Infection',
      probability: 'Very Common',
      solution: 'Medical evaluation, antibiotics if bacterial, pain relievers, warm compress.',
      urgency: 'Moderate'
    },
    {
      condition: 'Ear Wax Buildup',
      probability: 'Common',
      solution: 'Ear drops to soften wax, gentle irrigation, medical removal if needed, avoid cotton swabs.',
      urgency: 'Low'
    },
    {
      condition: 'Swimmers Ear',
      probability: 'Common',
      solution: 'Keep ear dry, antibiotic ear drops if prescribed, preventive ear drops after swimming.',
      urgency: 'Moderate'
    },
    {
      condition: 'Temporomandibular Joint Disorder',
      probability: 'Common',
      solution: 'Jaw exercises, warm compresses, soft diet, stress management, dental evaluation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Sinus Infection',
      probability: 'Common',
      solution: 'Decongestants, nasal irrigation, pain relievers, antibiotics if bacterial and severe.',
      urgency: 'Moderate'
    }
  ],
  
  Tinnitus: [
    {
      condition: 'Noise Exposure',
      probability: 'Common',
      solution: 'Avoid loud noise, sound therapy, hearing protection, relaxation techniques.',
      urgency: 'Low'
    },
    {
      condition: 'Age-Related Hearing Changes',
      probability: 'Common (in older adults)',
      solution: 'Sound therapy, hearing aids if recommended, relaxation techniques.',
      urgency: 'Low'
    },
    {
      condition: 'Ear Wax Buildup',
      probability: 'Common',
      solution: 'Ear drops to soften wax, gentle irrigation, medical removal if needed, avoid cotton swabs.',
      urgency: 'Low'
    },
    {
      condition: 'Medication Side Effect',
      probability: 'Common',
      solution: 'Medical review of medications, do not stop prescribed medications without consultation.',
      urgency: 'Moderate'
    },
    {
      condition: 'Ménières Disease',
      probability: 'Less Common',
      solution: 'Medical evaluation, salt restriction, diuretics or other medications if prescribed.',
      urgency: 'Moderate'
    },
    {
      condition: 'High Blood Pressure',
      probability: 'Possible',
      solution: 'Blood pressure monitoring, lifestyle modifications, medications if prescribed.',
      urgency: 'Moderate'
    }
  ],
  
  'Ear Discharge': [
    {
      condition: 'Ear Infection',
      probability: 'Common',
      solution: 'Medical evaluation, antibiotics if bacterial, keep ear dry, pain relievers if needed.',
      urgency: 'Moderate'
    },
    {
      condition: 'Swimmers Ear',
      probability: 'Common',
      solution: 'Keep ear dry, antibiotic ear drops if prescribed, preventive ear drops after swimming.',
      urgency: 'Moderate'
    },
    {
      condition: 'Ruptured Eardrum',
      probability: 'Possible',
      solution: 'Medical evaluation, keep ear dry, antibiotics if infected, usually heals on its own.',
      urgency: 'Moderate'
    },
    {
      condition: 'Cholesteatoma',
      probability: 'Less Common',
      solution: 'Medical evaluation, possible surgery, regular ear cleaning by healthcare professional.',
      urgency: 'Moderate'
    },
    {
      condition: 'Foreign Body',
      probability: 'Possible (especially in children)',
      solution: 'Medical removal, do not attempt to remove at home with objects.',
      urgency: 'Moderate'
    }
  ],
  
  'Ear Fullness': [
    {
      condition: 'Ear Wax Buildup',
      probability: 'Very Common',
      solution: 'Ear drops to soften wax, gentle irrigation, medical removal if needed, avoid cotton swabs.',
      urgency: 'Low'
    },
    {
      condition: 'Eustachian Tube Dysfunction',
      probability: 'Common',
      solution: 'Nasal decongestants, nasal steroids, swallowing and yawning exercises, nasal breathing.',
      urgency: 'Low'
    },
    {
      condition: 'Middle Ear Fluid',
      probability: 'Common',
      solution: 'Time (often resolves on its own), decongestants, medical evaluation if persistent.',
      urgency: 'Low'
    },
    {
      condition: 'Sinus Congestion',
      probability: 'Common',
      solution: 'Nasal irrigation, decongestants, steam inhalation, adequate hydration.',
      urgency: 'Low'
    },
    {
      condition: 'Ménières Disease',
      probability: 'Less Common',
      solution: 'Medical evaluation, salt restriction, diuretics or other medications if prescribed.',
      urgency: 'Moderate'
    }
  ],
  
  'Itchy Ears': [
    {
      condition: 'Dry Skin',
      probability: 'Common',
      solution: 'Avoid inserting objects, mild mineral oil or prescribed ear drops, avoid harsh soaps.',
      urgency: 'Low'
    },
    {
      condition: 'Allergic Reaction',
      probability: 'Common',
      solution: 'Identify and avoid allergens, antihistamines, prescribed ear drops if needed.',
      urgency: 'Low'
    },
    {
      condition: 'Ear Infection',
      probability: 'Possible',
      solution: 'Medical evaluation, antibiotics if bacterial, antifungals if fungal, keep ear dry.',
      urgency: 'Moderate'
    },
    {
      condition: 'Eczema',
      probability: 'Common',
      solution: 'Prescribed steroid drops or creams, keep area clean and dry, avoid irritants.',
      urgency: 'Low'
    },
    {
      condition: 'Ear Wax Issues',
      probability: 'Common',
      solution: 'Proper ear cleaning by healthcare professional, avoid cotton swabs.',
      urgency: 'Low'
    }
  ],

  'Vomiting': [
    {
      condition: 'Gastroenteritis',
      probability: 'Common',
      solution: 'Stay hydrated with small sips of clear fluids, rest, gradually reintroduce bland foods.',
      urgency: 'Moderate'
    },
    {
      condition: 'Food Poisoning',
      probability: 'Common',
      solution: 'Hydration, rest, seek medical attention if severe, persistent, or with high fever.',
      urgency: 'Moderate'
    },
    {
      condition: 'Appendicitis',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE if accompanied by severe right lower abdominal pain and fever.',
      urgency: 'Critical'
    },
    {
      condition: 'Migraine',
      probability: 'Possible',
      solution: 'Rest in dark room, migraine medication, anti-nausea medication, stay hydrated.',
      urgency: 'Moderate'
    },
    {
      condition: 'Pregnancy',
      probability: 'Possible',
      solution: 'Small frequent meals, ginger tea, vitamin B6, prescription medication if severe.',
      urgency: 'Low to Moderate'
    },
    {
      condition: 'Intestinal Obstruction',
      probability: 'Less Common',
      solution: 'SEEK EMERGENCY CARE if persistent vomiting, especially if unable to pass gas or stool.',
      urgency: 'Critical'
    }
  
  ]

  

};

// Product suggestions
// Product suggestions for 150+ symptoms
export const productSuggestions = {
  // Common symptoms
  'Headache': ['Crocin 650', 'Dolo 650', 'Saridon', 'Aspirin', 'Excedrin', 'Advil', 'Tylenol', 'Migraine Relief Gel', 'Headache Relief Patch', 'Cooling Gel Pack', 'Peppermint Essential Oil'],
  'Fever': ['Paracetamol 500', 'Dolo 650', 'Calpol', 'Metacin', 'Febrol', 'Tylenol', 'Disprin', 'Digital Thermometer', 'Cooling Gel Sheets', 'Electrolyte Solutions', 'Fever Relief Patches'],
  'Cough': ['Vicks Cough Drops', 'Benadryl Syrup', 'Himalaya Koflet', 'Ascoril', 'Corex', 'Cheston Cold', 'Bro-Zedex', 'Honey Ginger Tea', 'Throat Lozenges', 'Steam Inhaler', 'Humidifier'],
  'Sore Throat': ['Strepsils', 'Vicks Vaporub', 'Halls', 'Chloraseptic Spray', 'Betadine Gargle', 'Honitus', 'Throat Coat Tea', 'Himalaya Throat Relief', 'Ginger-Honey Lozenges', 'Echinacea Spray'],
  'Fatigue': ['Revital', 'Centrum', 'B-Complex tablets', 'Electrolyte solutions', 'Glucose-D', 'Ensure Nutrition Powder', 'Iron Supplements', 'Vitamin D3 Tablets', 'Protein Supplements', 'Energy Drinks', 'Ginseng Capsules'],
  'Abdominal Pain': ['Eno', 'Digene', 'Gelusil', 'Gas-O-Fast', 'Pudin Hara', 'Buscopan', 'Meftal Spas', 'Hot Water Bottle', 'Heating Pad', 'Peppermint Tea', 'Ginger Capsules'],
  'Dizziness': ['Vertin', 'Stugeron', 'Dramamine', 'Avomine', 'Hydration salts like Electral', 'Ginger Supplements', 'B12 Supplements', 'Iron Tablets', 'Blood Pressure Monitor'],
  'Joint Pain': ['Volini Spray', 'Moov', 'Iodex', 'FastRelief', 'Joint Guard', 'Voveran', 'Combiflam', 'Knee Support Braces', 'Joint Support Bandages', 'Turmeric Capsules', 'Glucosamine Supplements'],
  'Rash': ['Caladryl Lotion', 'Benadryl Cream', 'Hydrocortisone cream', 'Soframycin', 'Betnovate', 'Itchguard', 'Aloe Vera Gel', 'Calamine Lotion', 'Anti-Allergy Pills', 'Oatmeal Bath Solutions'],
  'Shortness of Breath': ['Asthalin Inhaler', 'Levolin Inhaler', 'Aerocort', 'Duolin Respules', 'Pulse Oximeter', 'Nebulizer', 'Oxygen Cans', 'Breathing Exercise Devices'],
  'Diarrhea': ['ORS Packets', 'Enteroquinol', 'Eldoper', 'Lopamide', 'Pepto-Bismol', 'Flagyl', 'Norflox', 'Probiotics', 'Electrolyte Drinks', 'Yogurt', 'Digestive Enzymes'],
  'Constipation': ['Duphalac', 'Cremaffin', 'Isabgol', 'Softovac', 'Dulcolax', 'Naturolax', 'Fiber Supplements', 'Prune Juice', 'Stool Softeners', 'Digestive Teas'],
  'Vomiting': ['Perinorm', 'Vomikind', 'Ondem', 'Emeset', 'Avomine', 'Domperidone', 'Ginger Tea', 'Anti-Nausea Wristbands', 'Electrolyte Solutions', 'Peppermint Oil'],
  'Loss of Appetite': ['Appetite Stimulant Syrup', 'Zincovit', 'Becosules', 'Kidvit', 'Nutrition Supplements', 'Protein Shakes', 'Vitamin B Complex', 'Ginger Candies', 'Digestive Enzymes'],
  'Sleeplessness': ['Melatonin supplements', 'Sompraz', 'Restyl', 'Sleep-Aid teas', 'Valerian root supplements', 'Lavender Essential Oil', 'White Noise Machine', 'Sleep Mask', 'Chamomile Tea'],
  'Anxiety': ['Stress-relief teas', 'Ashwagandha tablets', 'L-theanine supplements', 'Bach Rescue Remedy', 'Lavender Oil', 'Stress Relief Balls', 'Meditation Apps', 'Chamomile Supplements', 'CBD Oil'],
  'Back Pain': ['Volini Gel', 'Moov Spray', 'Hot water bag', 'Lumbar support cushion', 'Pain relief patches', 'Back Support Belt', 'Acupressure Mat', 'TENS Unit', 'Massage Roller', 'Ice Packs'],
  'Blur of Vision': ['Lubricating eye drops', 'Itone eye drops', 'Ocuvit tablets', 'Eye wash solution', 'Computer Glasses', 'Vitamin A Supplements', 'Eye Masks', 'Warm Compress'],
  'Earache': ['Otrivin ear drops', 'Soliwax ear drops', 'Candibiotic ear drops', 'Earbuds', 'Ear Warming Compress', 'Ear Plugs', 'Pain Relievers', 'Swimmers Ear Solutions'],
  'Dry Skin': ['Cetaphil Moisturizer', 'Nivea Cream', 'Vaseline', 'Moisturex', 'Body Butter', 'Coconut Oil', 'Humidifier', 'Hyaluronic Acid Serum', 'Vitamin E Oil', 'Oatmeal Bath'],
  'Wheezing': ['Asthalin inhaler', 'Duolin inhaler', 'Foracort', 'Budecort', 'Montek LC', 'Nebulizer', 'Spacer Device', 'Peak Flow Meter', 'Air Purifier', 'Allergy-Proof Bedding'],
  'Nasal Congestion': ['Otrivin Nasal Spray', 'Nasivion', 'Sinarest Tablets', 'Steam Inhaler', 'Vicks Inhaler', 'Nasal Irrigation System', 'Eucalyptus Oil', 'Humidifier', 'Nasal Strips', 'Antihistamines'],
  'Eye Redness': ['Clear Eyes Drops', 'Visine', 'Itone Eye Drops', 'Refresh Tears', 'Optrex Eye Wash', 'Cooling Eye Mask', 'Allergy Eye Drops', 'Lubricating Eye Gel', 'Vitamin A & D Drops'],
  'Muscle Pain': ['Fast Relief Spray', 'Moov Cream', 'Volini Gel', 'Tiger Balm', 'Relaxyl', 'Myospaz', 'Heat Patches', 'Massage Rollers', 'Muscle Relaxant Balms', 'Pain Relief Patches'],
  'Depression': ['St. Johns Wort', 'Omega-3 Supplements', 'SAMe Supplements', 'Vitamin D3', 'B-Complex Vitamins', 'Light Therapy Lamps', 'Meditation Apps', 'Exercise Equipment', 'Journaling Supplies'],
  'Acid Reflux': ['Pantoprazole', 'Ranitidine', 'Antacids', 'Gaviscon', 'Proton Pump Inhibitors', 'Herbal Digestive Teas', 'Wedge Pillows', 'Aloe Vera Juice', 'Ginger Supplements'],
  'Nausea': ['Ginger Candies', 'Peppermint Tea', 'Anti-nausea Wristbands', 'Dramamine', 'Vitamin B6 Supplements', 'Acupressure Bands', 'Chamomile Tea', 'Lemon Essential Oil', 'Electrolyte Drinks'],
  'Chest Pain': ['Aspirin', 'Nitroglycerin (prescription)', 'Antacids', 'Pain Relievers', 'Blood Pressure Monitor', 'ECG Monitor', 'Heart Rate Monitor', 'Stress Relief Aids'],
  
  // Additional symptoms
  'Heartburn': ['Eno', 'Gelusil', 'Digene', 'Ranitidine', 'Pantoprazole', 'Gaviscon', 'Herbal Digestive Teas', 'Apple Cider Vinegar', 'Slippery Elm Supplements'],
  'Bloating': ['Eno', 'Gas-O-Fast', 'Activated Charcoal', 'Digestive Enzymes', 'Peppermint Capsules', 'Ginger Tea', 'Probiotics', 'Fennel Seeds', 'Caraway Seed Supplements'],
  'Indigestion': ['Antacids', 'Digestive Enzymes', 'Herbal Bitters', 'Ginger Supplements', 'Peppermint Oil Capsules', 'Probiotics', 'Papaya Enzymes', 'Chamomile Tea'],
  'Weight Loss': ['Protein Supplements', 'Meal Replacement Shakes', 'Fiber Supplements', 'Multivitamins', 'Green Tea Extract', 'Appetite Suppressants', 'Metabolism Boosters', 'Nutrient Trackers'],
  'Weight Gain': ['Mass Gainer Supplements', 'Protein Powders', 'Appetite Stimulants', 'Calorie Tracker Apps', 'Nutrition Supplements', 'Creatine', 'Vitamin D', 'Weight Scales'],
  'Swollen Lymph Nodes': ['Pain Relievers', 'Warm Compresses', 'Echinacea Supplements', 'Vitamin C', 'Zinc Lozenges', 'Turmeric Supplements', 'Immune Boosting Teas', 'Arnica Gel'],
  'Memory Loss': ['Ginkgo Biloba', 'Omega-3 Supplements', 'B-Complex Vitamins', 'Memory Games', 'Memory Training Apps', 'Notebooks/Journals', 'Pill Organizers', 'Vitamin E Supplements', 'Curcumin/Turmeric Supplements'],
  'Hair Loss': ['Minoxidil Solutions', 'Biotin Supplements', 'Nizoral Shampoo', 'Hair Growth Vitamins', 'Scalp Massagers', 'DHT Blocker Supplements', 'Multivitamin Hair Formulas', 'Strengthening Shampoos', 'Hair Growth Oils'],
  'Dry Mouth': ['Biotene Spray', 'Xerostom Products', 'Xylitol Gum', 'Mouth Moisturizing Gel', 'Saliva Substitutes', 'Sugar-free Lozenges', 'Humidifier', 'Alcohol-free Mouthwash', 'Water Bottle Reminder Apps'],
  'Excessive Thirst': ['Electrolyte Drinks', 'Sugar Testing Kit', 'Blood Pressure Monitor', 'Hydration Tracking Bottles', 'Glucose Tablets', 'Multivitamins', 'Hydration Reminder Apps', 'Reusable Water Bottles'],
  'Frequent Urination': ['Cranberry Supplements', 'Pelvic Floor Exercisers', 'Bladder Training Timers', 'UTI Test Strips', 'Glucose Monitoring Kits', 'Absorbent Underwear', 'Bladder Supplements', 'Herbal Teas for Bladder Health'],
  'Painful Urination': ['UTI Test Kits', 'Cranberry Supplements', 'Pain Relievers', 'Heating Pads', 'D-Mannose Supplements', 'Probiotics for Urinary Health', 'Alkalizing Agents', 'Sitz Bath Basins'],
  'Blood in Urine': ['UTI Test Strips', 'Cranberry Supplements', 'Pain Relievers', 'Urinalysis Containers', 'Blood Pressure Monitor', 'Electrolyte Drinks', 'Vitamin K Supplements', 'Medical Alert Bracelets'],
  'Loss of Smell': ['Zinc Supplements', 'Smell Training Kits', 'Saline Nasal Sprays', 'Nasal Irrigation Systems', 'Essential Oil Sets', 'Vitamin A Supplements', 'Steam Inhalers', 'Nasal Strips', 'Air Purifiers'],
  'Loss of Taste': ['Zinc Supplements', 'Taste Training Kits', 'Oral Hygiene Products', 'Saliva Stimulants', 'B-Complex Vitamins', 'Artificial Saliva Products', 'Oral Rinses', 'Biotene Products'],
  'Mouth Ulcers': ['Orajel', 'Kenalog in Orabase', 'Anbesol', 'Zilactin', 'Multivitamins', 'Lysine Supplements', 'Vitamin B12', 'Mouthwash for Ulcers', 'Oral Healing Gels'],
  'Bad Breath': ['Antibacterial Mouthwash', 'Tongue Scrapers', 'Chlorophyll Supplements', 'Probiotic Lozenges', 'Sugar-free Gum', 'Oral Irrigators', 'Zinc Supplements', 'Breath Freshening Strips', 'Dental Floss'],
  'Gum Bleeding': ['Antiseptic Mouthwash', 'Soft Toothbrushes', 'Gum Massage Brushes', 'Vitamin C Supplements', 'CoQ10 Supplements', 'Water Flossers', 'Oral Probiotics', 'Fluoride Rinses', 'Gum Healing Gels'],
  'Bruising Easily': ['Vitamin K Cream', 'Arnica Gel', 'Vitamin C Supplements', 'Bromelain', 'Rutin Supplements', 'Bio-Oil', 'Cooling Compresses', 'Iron Supplements', 'Compression Garments'],
  'Yellowing of Skin': ['Milk Thistle', 'Turmeric Supplements', 'Vitamin D', 'Liver Support Supplements', 'Glucose Monitoring Kits', 'Hydration Tracking Bottles', 'Protein Supplements', 'Medical Alert Bracelets'],
  'Tremors': ['Magnesium Supplements', 'Weighted Utensils', 'Weighted Blankets', 'B-Complex Vitamins', 'Stress Relief Supplements', 'Anti-tremor Gloves', 'Adaptive Writing Tools', 'Stabilizing Wrist Braces'],
  'Seizures': ['Medical Alert Bracelets', 'Seizure Tracking Apps', 'Protective Headgear', 'Vitamin E Supplements', 'Magnesium Supplements', 'Bed Alarms', 'Padded Side Rails', 'Oral pH Testing Strips'],
  'Confusion': ['Medical Alert Devices', 'Memory Aids', 'Pill Organizers', 'Calendar Reminders', 'Simple Phones', 'GPS Trackers', 'Hydration Reminders', 'Blood Sugar Monitors', 'Blood Pressure Monitors'],
  'Difficulty Concentrating': ['L-Theanine Supplements', 'Omega-3 Fatty Acids', 'Noise-Cancelling Headphones', 'Focus Apps', 'Vitamin B12', 'Fidget Tools', 'Blue Light Blocking Glasses', 'Air Purifiers', 'Productivity Timers'],
  'Chest Tightness': ['Rescue Inhalers', 'Spacer Devices', 'Peak Flow Meters', 'Air Purifiers', 'Pulse Oximeters', 'Breathing Exercise Apps', 'Herbal Teas', 'HEPA Air Filters', 'Steam Inhalers'],
  'Hives': ['Antihistamine Tablets', 'Calamine Lotion', 'Oatmeal Bath Products', 'Cold Compresses', 'Aloe Vera Gel', 'Allergy Tracking Apps', 'HEPA Air Purifiers', 'Hypoallergenic Bedding', 'Vitamin C Supplements'],
  'Swollen Face': ['Cold Compresses', 'Antihistamines', 'Facial Rollers', 'Anti-Allergy Pillowcases', 'Nasal Sprays', 'Electrolyte Drinks', 'Allergy Testing Kits', 'Hypoallergenic Skin Products'],
  'Tongue Swelling': ['Antihistamines', 'Cold Compresses', 'Medical Alert Bracelets', 'Ice Packs', 'Alcohol-Free Mouthwash', 'Saltwater Rinse Supplies', 'Allergy Testing Kits', 'Emergency Action Plan Kits'],
  'Hoarseness': ['Throat Lozenges', 'Steam Inhalers', 'Humidifiers', 'Voice Rest Reminder Apps', 'Herbal Teas', 'Honey-Based Remedies', 'Throat Coat Sprays', 'Alkaline Water pH Drops', 'Saline Nasal Sprays'],
  'Difficulty Swallowing': ['Thickening Agents', 'Swallow Therapy Tools', 'Specialized Cups/Straws', 'Postural Support Devices', 'Throat Numbing Sprays', 'Medical Alert Bracelets', 'Moisture Sprays', 'Soft Food Recipe Books'],
  'Burning Sensation in Chest': ['Antacids', 'Proton Pump Inhibitors', 'H2 Blockers', 'Elevated Pillows/Wedges', 'Digestive Enzymes', 'Aloe Vera Juice', 'Herbal Teas', 'Food Diary Apps', 'pH Testing Strips'],
  'Fainting': ['Medical Alert Bracelets', 'Home BP Monitors', 'Glucose Meters', 'Compression Stockings', 'Salt Tablets', 'Electrolyte Drinks', 'Fall Detection Devices', 'Emergency Response Systems', 'Protective Headgear'],
  'Tingling': ['B-Complex Vitamins', 'Alpha Lipoic Acid', 'Magnesium Supplements', 'Compression Gloves/Socks', 'TENS Units', 'Acupressure Mats', 'Capsaicin Cream', 'Ergonomic Tools', 'Wrist Supports'],
  'Excessive Sweating': ['Clinical Strength Antiperspirants', 'Sweat-Wicking Clothing', 'Absorbent Pads', 'Talcum Powder', 'Sage Supplements', 'Iontophoresis Devices', 'Aluminum Chloride Solutions', 'Propantheline Bromide', 'Cooling Towels'],
  'Cold Hands or Feet': ['Hand/Foot Warmers', 'Heated Gloves/Socks', 'Circulation Boosting Supplements', 'Compression Socks', 'Thermal Insoles', 'Niacin Supplements', 'Massage Tools', 'Arginine Supplements', 'Ginkgo Biloba'],
  'Brittle Nails': ['Biotin Supplements', 'Nail Strengtheners', 'Keratin Supplements', 'Cuticle Oils', 'Nail Hardeners', 'Vitamin E Oil', 'Collagen Supplements', 'Nail Repair Kits', 'Protein-Rich Nail Treatments'],
  'Muscle Cramping': ['Magnesium Supplements', 'Calcium Supplements', 'Potassium-Rich Electrolyte Drinks', 'Foam Rollers', 'Massage Tools', 'Quinine Supplements', 'Muscle Relaxants', 'Heating Pads', 'Epsom Salt'],
  'Ankle Pain': ['Ankle Braces', 'Compression Sleeves', 'Arch Support Insoles', 'Pain Relief Creams', 'Ice Packs', 'Elevation Pillows', 'KT Tape', 'Crutches', 'Walking Boots', 'Balance Training Tools'],
  'Wrist Pain': ['Wrist Braces', 'Ergonomic Mouse/Keyboard', 'Compression Gloves', 'NSAID Creams', 'Cold/Hot Therapy Wraps', 'Carpal Tunnel Exercises', 'Wrist Supports', 'Massage Tools', 'Acupressure Bands'],
  'Hip Pain': ['Hip Support Braces', 'Cushioned Seats', 'Supportive Mattresses', 'Hot/Cold Therapy Wraps', 'Pain Relief Creams', 'Glucosamine Supplements', 'Walking Aids', 'Wedge Pillows', 'Stretching Straps'],
  'Stiffness': ['Joint Supplements', 'Heating Pads', 'Muscle Relaxants', 'Massage Tools', 'Stretching Aids', 'Warm Therapy Wraps', 'Anti-inflammatory Supplements', 'Epsom Salt Baths', 'Hot Water Bottles', 'Compression Garments'],
  'Swollen Joints': ['Compression Wraps', 'Ice Packs', 'Elevation Pillows', 'Anti-inflammatory Supplements', 'Arnica Gel', 'Turmeric/Curcumin', 'Support Braces', 'Epsom Salt', 'NSAID Creams', 'Collagen Supplements'],
  'Foot Pain': ['Orthotic Insoles', 'Foot Massage Rollers', 'Pain Relief Creams', 'Specialized Footwear', 'Night Splints', 'Toe Separators', 'Metatarsal Pads', 'Foot Soaking Tubs', 'Compression Socks', 'Foot Alignment Socks'],
  'Difficulty Walking': ['Walking Aids', 'Supportive Footwear', 'Balance Training Tools', 'Knee/Ankle Braces', 'Physical Therapy Aids', 'Fall Prevention Devices', 'Gait Training Harnesses', 'Pain Relief Products', 'Mobility Scooters'],
  'Eye Discharge': ['Saline Eye Wash', 'Eye Cleaning Wipes', 'Antibiotic Eye Drops', 'Warm Compresses', 'Eyelid Scrubs', 'Lubricating Eye Drops', 'Antihistamine Eye Drops', 'Eye Masks', 'Hypoallergenic Eye Products'],
  'Eye Redness': ['Lubricating Eye Drops', 'Antihistamine Eye Drops', 'Cooling Eye Compresses', 'Artificial Tears', 'Redness Relief Drops', 'Preservative-Free Eye Drops', 'Eye Wash Solutions', 'Blue Light Blocking Glasses', 'Humidifiers'],
  'Swollen Eyelids': ['Cold Compresses', 'Antihistamine Eye Drops', 'Artificial Tears', 'Allergy Medications', 'Cooling Eye Masks', 'Tea Bag Compresses', 'Hypoallergenic Eye Products', 'Eye Rinses', 'Eye Pillows'],
  'Ear Discharge': ['Ear Cleaning Kits', 'Antibiotic Ear Drops', 'Ear Wicks', 'Cotton Balls', 'Hydrogen Peroxide Solutions', 'Ear Drying Aids', 'Ear Bandages', 'Ear Protection', 'Antiseptic Solutions'],
  'Ear Fullness': ['Ear Popping Relief Products', 'Decongestants', 'Nasal Sprays', 'Ear Drops for Wax', 'Ear Irrigation Kits', 'Ear Pressure Equalizers', 'Steam Inhalers', 'Eustachian Tube Massagers', 'Valsalva Devices'],
  'Itchy Ears': ['Ear Drops for Itching', 'Mineral Oil Drops', 'Doctor-Approved Ear Cleaning Tools', 'Antihistamines', 'Anti-fungal Ear Solutions', 'Ear Wicks', 'Hypoallergenic Ear Products', 'Ear Protectors'],
  'Facial Pain': ['Pain Relievers', 'Warm Compresses', 'Cold Packs', 'Facial Massage Tools', 'Essential Oil Roll-ons', 'Sinus Rinse Kits', 'Numbing Creams', 'TMJ Support Devices', 'Facial Exercises', 'Stress Relief Products'],
  'Jaw Pain': ['TMJ Night Guards', 'Jaw Support Wraps', 'Warm/Cold Compresses', 'Jaw Exercises', 'Pain Relief Creams', 'Massage Tools', 'Relaxation Aids', 'Anti-inflammatory Medications', 'Mouth Splints'],
  'Bleeding Gums': ['Soft Toothbrushes', 'Antimicrobial Mouthwash', 'Water Flossers', 'Styptic Pencils', 'Vitamin C Supplements', 'Oral Probiotics', 'Gum Massage Tools', 'Gum Sealing Products', 'CoQ10 Supplements'],
  'Toothache': ['Clove Oil', 'Oral Numbing Gels', 'Temporary Filling Materials', 'Pain Relievers', 'Cold Compresses', 'Saltwater Rinse Supplies', 'Dental Wax', 'Toothache Drops', 'Oil Pulling Products'],
  'Frequent Coughing': ['Cough Suppressants', 'Expectorants', 'Throat Lozenges', 'Honey-Based Remedies', 'Humidifiers', 'Steam Inhalers', 'Air Purifiers', 'Herbal Teas', 'Saline Nasal Sprays', 'Cough Tracking Apps'],
  'Coughing Blood': ['Humidifiers', 'Steam Inhalers', 'Medical Alert Bracelets', 'Blood Pressure Monitors', 'Oxygen Saturation Monitors', 'First Aid Kits', 'Symptom Tracking Apps', 'Herbal Teas', 'Warm Water Bottles'],
  'Nasal Congestion': ['Saline Nasal Sprays', 'Neti Pots', 'Nasal Strips', 'Decongestants', 'Steam Inhalers', 'Eucalyptus Oil', 'Humidifiers', 'Air Purifiers', 'Nasal Dilators', 'Allergy Medications'],
  'Post-Nasal Drip': ['Saline Nasal Rinses', 'Antihistamines', 'Decongestants', 'Mucolytics', 'Nasal Sprays', 'Elevated Pillows', 'Steam Inhalers', 'Herbal Teas', 'Air Purifiers', 'Humidifiers'],
  'Increased Heart Rate': ['Heart Rate Monitors', 'Blood Pressure Devices', 'Magnesium Supplements', 'Portable ECG Devices', 'Relaxation Aids', 'Deep Breathing Tools', 'Hydration Tracking Bottles', 'Symptom Journal', 'Medical Alert Bracelets'],
  'Sexual Dysfunction': ['Lubricants', 'Pelvic Floor Exercisers', 'Herbal Supplements', 'Vitamin E', 'L-arginine', 'Zinc Supplements', 'Relationship Books', 'Communication Cards', 'Stress Relief Products'],
  'Irregular Periods': ['Period Tracking Apps', 'Heating Pads', 'Iron Supplements', 'Vitamin B6', 'Omega-3 Supplements', 'Herbal Teas', 'Chaste Tree Berry Supplements', 'Magnesium Supplements', 'Symptom Journals'],
  'Breast Pain': ['Supportive Bras', 'Warm/Cold Compresses', 'Evening Primrose Oil', 'Vitamin E', 'Pain Relievers', 'Anti-inflammatory Herbs', 'Magnesium Supplements', 'Castor Oil Packs', 'Symptom Tracking Apps'],
  'Menstrual Cramps': ['Heating Pads', 'TENS Units', 'Herbal Teas', 'Magnesium Supplements', 'Pain Relievers', 'Essential Oil Blends', 'CBD Products', 'Period Tracking Apps', 'Exercise Guides', 'Warm Water Bottles'],
  'Vaginal Discharge': ['pH Balanced Washes', 'Cotton Underwear', 'Probiotics', 'Pad/Liner Products', 'Symptom Tracking Apps', 'pH Test Strips', 'Yeast Infection Treatments', 'Vaginal Moisturizers', 'Reusable Cloth Pads'],
  'Vaginal Itching': ['Anti-itch Creams', 'pH Balanced Products', 'Probiotics', 'Boric Acid Suppositories', 'Cotton Underwear', 'Oatmeal Bath Preparations', 'OTC Antifungal Treatments', 'Cold Compresses', 'Sitz Baths'],
  'Testicular Pain': ['Athletic Supporters', 'Ice Packs', 'Pain Relievers', 'Compression Shorts', 'Symptom Diaries', 'Pillow Supports', 'Loose-fitting Underwear', 'Anti-inflammatory Supplements', 'Relaxation Tools'],
  'Blood in Stool': ['Fiber Supplements', 'Hemorrhoid Treatments', 'Stool Softeners', 'Toilet Aids', 'Symptom Tracking Apps', 'Wipes', 'Medical Alert Cards', 'Probiotics', 'Iron Supplements', 'Hydration Reminders'],
  'Heartburn': ['Antacids', 'Proton Pump Inhibitors', 'H2 Blockers', 'Aloe Vera Juice', 'Wedge Pillows', 'Digestive Enzymes', 'Meal Planning Tools', 'Apple Cider Vinegar', 'Trigger Food Tracking Apps'],
  'Bloating': ['Digestive Enzymes', 'Activated Charcoal', 'Probiotics', 'Gas Relief Medications', 'Abdominal Massage Tools', 'Peppermint Oil Capsules', 'Food Intolerance Tests', 'Gut Health Supplements', 'Herbal Teas'],
  'Flatulence': ['Digestive Enzymes', 'Activated Charcoal', 'Simethicone', 'Probiotics', 'Peppermint Capsules', 'Fennel Tea', 'Gas-X', 'Food Diary Apps', 'Digestive Bitters', 'Herbal Supplements'],
  'Incontinence': ['Absorbent Products', 'Pelvic Floor Exercisers', 'Bladder Training Timers', 'Waterproof Bedding', 'Specialized Underwear', 'Bladder Support Supplements', 'Toilet Finder Apps', 'Kegel Exercise Tools'],
  'Low Back Pain': ['Lumbar Support Cushions', 'Pain Relief Patches', 'TENS Units', 'Massage Tools', 'Posture Correctors', 'Yoga/Stretching Guides', 'Anti-inflammatory Supplements', 'Hot/Cold Therapy Wraps', 'Back Braces'],
  'Swollen Glands': ['Warm Compresses', 'Pain Relievers', 'Echinacea', 'Vitamin C', 'Zinc Lozenges', 'Glandular Support Supplements', 'Symptom Tracking Apps', 'Hydration Reminders', 'Lymphatic Drainage Tools'],
  'Skin Ulcers': ['Wound Dressings', 'Hydrocolloid Bandages', 'Antimicrobial Solutions', 'Pressure Relief Cushions', 'Zinc Supplements', 'Vitamin C', 'Wound Measuring Tools', 'Wound Cleansers', 'Skin Protectants', 'Medical Honey'],
  'Genital Sores': ['Barrier Products', 'Antiseptic Solutions', 'Pain Relief Gels', 'Lysine Supplements', 'Sitz Bath Basins', 'Loose-Fitting Underwear', 'Symptom Tracking Apps', 'Cold Compresses', 'Zinc Oxide Creams'],
  'Excessive Gas': ['Gas Relief Tablets', 'Digestive Enzymes', 'Activated Charcoal', 'Probiotics', 'Peppermint Oil Capsules', 'Fennel Tea', 'Food Diary Apps', 'Abdominal Massage Tools', 'Carminative Herbs'],
  'Indigestion': ['Antacids', 'Digestive Enzymes', 'Ginger Supplements', 'Bitters', 'Herbal Teas', 'Meal Planning Tools', 'Apple Cider Vinegar', 'Probiotics', 'Food Diary Apps', 'Meal Timers'],
  'Reduced Appetite': ['Meal Replacement Shakes', 'Protein Supplements', 'Appetite Stimulants', 'Multivitamins', 'Meal Planners', 'Flavor Enhancers', 'Meal Reminder Apps', 'Zinc Supplements', 'Small Portion Dinnerware'],
  'Difficulty Breathing': ['Rescue Inhalers', 'Nebulizers', 'Oxygen Concentrators', 'Spacer Devices', 'Peak Flow Meters', 'Air Purifiers', 'Pulse Oximeters', 'Breathing Exercise Devices', 'Medical Alert Bracelets'],
  'Shortness of Breath at Night': ['Elevated Pillows', 'CPAP Machines', 'Air Purifiers', 'Humidifiers', 'Oxygen Monitors', 'Anti-allergen Bedding', 'Breathing Exercise Apps', 'Medication Organizers', 'Sleep Position Trainers'],
  'Dizziness When Standing': ['Compression Stockings', 'Blood Pressure Monitors', 'Electrolyte Drinks', 'Salt Tablets', 'Hydration Reminders', 'Medical Alert Bracelets', 'Support Canes', 'Home Safety Products', 'Symptom Diaries'],
  'Leg Pain': ['Support Stockings', 'Pain Relief Creams', 'Cushioned Insoles', 'Massage Tools', 'Leg Elevation Pillows', 'Compression Sleeves', 'Anti-inflammatory Supplements', 'TENS Units', 'Hot/Cold Therapy Wraps'],
  'Mood Swings': ['St. Johns Wort', 'Omega-3 Supplements', 'Mood Tracking Apps', 'Light Therapy Lamps', 'Stress Relief Products', 'B-Complex Vitamins', 'Meditation Apps', 'Calming Essential Oils', 'Weighted Blankets'],
  'Panic Attacks': ['Anti-anxiety Apps', 'Grounding Tools', 'Breathing Exercise Guides', 'Weighted Blankets', 'Calming Teas', 'L-theanine Supplements', 'Stress Balls', 'Essential Oil Blends', 'Medical Alert Cards'],
  'Obsessive Thoughts': ['CBT Workbooks', 'Mindfulness Apps', 'Distraction Tools', 'Worry Journals', 'Stress Relief Products', 'Habit Trackers', 'Meditation Guides', 'Relaxation Aids', 'Support Group Resources'],
  'Racing Thoughts': ['Meditation Apps', 'White Noise Machines', 'Journaling Supplies', 'Magnesium Supplements', 'Lavender Products', 'GABA Supplements', 'Relaxation Audios', 'Sleep Aids', 'Cognitive Behavioral Therapy Books'],
  'Excessive Worry': ['Anxiety Relief Supplements', 'Worry Journals', 'CBT Workbooks', 'Meditation Apps', 'Aromatherapy Products', 'Herbal Teas', 'Stress Balls', 'Guided Imagery Resources', 'Breathing Exercise Tools'],
  'Hallucinations': ['Medical Alert Bracelets', 'Medication Organizers', 'Symptom Tracking Apps', 'Voice Recording Devices', 'Safety Lighting', 'Sleep Optimization Tools', 'Hydration Reminders', 'B-Complex Vitamins'],
  'Blood Pressure Changes': ['Home BP Monitors', 'Medication Trackers', 'Salt Substitutes', 'Potassium Supplements', 'Magnesium Supplements', 'BP Tracking Apps', 'Meditation Guides', 'DASH Diet Resources', 'Medical Alert Bracelets'],
  'Abnormal Heart Rhythm': ['Heart Rate Monitors', 'Portable ECG Devices', 'Medication Organizers', 'Magnesium Supplements', 'CoQ10 Supplements', 'Heart Health Tracking Apps', 'Medical Alert Bracelets', 'Hydration Reminders'],
  'Varicose Veins': ['Compression Stockings', 'Leg Elevation Pillows', 'Horse Chestnut Supplements', 'Witch Hazel', 'Supportive Footwear', 'Anti-inflammatory Supplements', 'Foot Circulation Boosters', 'Cooling Gels'],
  'Leg Swelling': ['Compression Stockings', 'Leg Elevation Pillows', 'Diuretic Herbs', 'Electrolyte Drinks', 'Foot Circulation Boosters', 'Water Retention Supplements', 'Magnesium Supplements', 'Edema Measuring Tools'],
  'Intolerance to Cold': ['Thermal Clothing', 'Hand/Foot Warmers', 'Heated Blankets', 'Thyroid Support Supplements', 'Vitamin D', 'Iron Supplements', 'Ginger Products', 'Circulation Boosters', 'Temperature Monitoring Devices'],
  'Intolerance to Heat': ['Cooling Towels', 'Portable Fans', 'Cooling Vests', 'Electrolyte Drinks', 'Temperature Monitoring Devices', 'Anti-perspirants', 'Cooling Gel Sheets', 'Sun Protection', 'Hydration Tracking Tools'],
  'Unintended Weight Change': ['Digital Scales', 'Body Composition Monitors', 'Nutrition Tracking Apps', 'Meal Planning Tools', 'Multivitamins', 'Food Diary Journals', 'Portion Control Tools', 'Metabolic Support Supplements'],
  'Excessive Hunger': ['Blood Glucose Monitors', 'Fiber Supplements', 'Protein Supplements', 'Hunger Management Apps', 'Chromium Supplements', 'Hydration Trackers', 'Portion Control Tools', 'Meal Planning Resources'],
  'Acid Reflux': ['Antacids', 'Proton Pump Inhibitors', 'H2 Blockers', 'Wedge Pillows', 'pH Monitors', 'Alkaline Water Drops', 'Food Diary Apps', 'Digestive Enzymes', 'Trigger Food Guides', 'Aloe Vera Juice'],
  'Stomach Cramps': ['Antispasmodics', 'Heating Pads', 'Peppermint Oil Capsules', 'Probiotics', 'Digestive Enzymes', 'Anti-inflammatory Supplements', 'Gas Relief Medications', 'Abdominal Massage Tools', 'Herbal Teas'],
  'Rectal Bleeding': ['Hemorrhoid Treatments', 'Fiber Supplements', 'Stool Softeners', 'Sitz Bath Basins', 'Witch Hazel Pads', 'Symptom Tracking Apps', 'Medical Alert Cards', 'Soft Toilet Paper', 'Iron Supplements'],
  'Black Stool': ['Iron Supplements', 'Stool Color Charts', 'Symptom Tracking Apps', 'Medical Alert Cards', 'Probiotics', 'Fiber Supplements', 'Hydration Reminders', 'Hemorrhoid Treatments', 'Digestive Support Products'],
  'Pale Stool': ['Liver Support Supplements', 'Digestive Enzymes', 'Stool Color Charts', 'Symptom Tracking Apps', 'Probiotics', 'Bile Salts', 'Turmeric Supplements', 'Food Diary Apps', 'Hydration Reminders'],
  'Greasy Stool': ['Digestive Enzymes', 'Pancreatic Support Supplements', 'Probiotics', 'Fiber Supplements', 'Food Intolerance Tests', 'Symptom Tracking Apps', 'Stool Analysis Kits', 'Nutritional Counseling Resources'],
  'Bloody Mucus in Stool': ['Hemorrhoid Treatments', 'Fiber Supplements', 'Probiotics', 'Stool Collection Kits', 'Symptom Tracking Apps', 'Medical Alert Cards', 'Nutritional Support Products', 'Hydration Reminder Tools'],
  'Urinary Urgency': ['Bladder Training Timers', 'Pelvic Floor Exercisers', 'Cranberry Supplements', 'Absorbent Products', 'Bladder Calm Supplements', 'Toilet Finder Apps', 'D-Mannose Supplements', 'Urinary Tract Support Teas', 'Waterproof Bedding'],
  'Urinary Frequency': ['Bladder Training Apps', 'Pelvic Floor Strengtheners', 'Cranberry Supplements', 'Toilet Finder Apps', 'Bladder Support Herbs', 'Absorbent Products', 'Food/Drink Diary Apps', 'D-Mannose Supplements', 'Waterproof Mattress Covers'],
  'Urinary Hesitancy': ['Pelvic Relaxation Techniques', 'Warm Compresses', 'Alpha Blocker Information', 'Prostate Support Supplements', 'Bladder Diaries', 'Toilet Positioning Aids', 'Relaxation Audios', 'Hydration Trackers', 'Symptom Journals'],
  'Decreased Urine Output': ['Hydration Tracking Bottles', 'Electrolyte Supplements', 'Fluid Intake Reminder Apps', 'Urine Color Charts', 'Blood Pressure Monitors', 'Medical Alert Bracelets', 'Kidney Support Supplements', 'Symptom Journals'],
  'Dark Urine': ['Hydration Tracking Tools', 'Urine Color Charts', 'Electrolyte Drinks', 'Liver Support Supplements', 'Kidney Support Products', 'Symptom Tracking Apps', 'Medical Alert Cards', 'Liver Function Tests'],
  'Cloudy Urine': ['UTI Test Strips', 'Cranberry Supplements', 'D-Mannose', 'pH Testing Strips', 'Probiotics', 'Bladder Support Herbs', 'Hydration Trackers', 'Symptom Diaries', 'Sample Collection Containers'],
  'Foamy Urine': ['Kidney Support Supplements', 'Protein Testing Strips', 'Blood Pressure Monitors', 'Blood Sugar Monitors', 'Hydration Reminders', 'Symptom Tracking Apps', 'Medical Alert Cards', 'Low Protein Diet Resources'],
  'Foul-Smelling Urine': ['Cranberry Supplements', 'UTI Test Strips', 'Probiotics', 'D-Mannose', 'Water Intake Trackers', 'Antibacterial Wipes', 'pH Balancing Products', 'Vitamin C Supplements', 'Hydration Reminders'],
  'Bedwetting': ['Waterproof Mattress Covers', 'Absorbent Underwear', 'Bedwetting Alarms', 'Toilet Training Timers', 'Bladder Training Apps', 'Waterproof Bedding', 'Nighttime Fluid Intake Monitors', 'Supportive Resources'],
  'Double Vision': ['Eye Patches', 'Medical Alert Bracelets', 'Symptom Tracking Apps', 'Vision Therapy Tools', 'Prism Glasses', 'Eyeglass Cord Retainers', 'Home Safety Products', 'Vision Exercise Guides', 'Magnifiers'],
  'Night Blindness': ['Vitamin A Supplements', 'Night Driving Glasses', 'Home Safety Lighting', 'High-Visibility Products', 'Vision Support Supplements', 'Motion-Sensor Lights', 'Medical Alert Cards', 'Magnifiers'],
  'Sensitivity to Light': ['Polarized Sunglasses', 'Blue Light Filters', 'Tinted Lenses', 'Hat with Brim', 'Light Dimming Apps', 'Anti-glare Screen Protectors', 'Light Sensitivity Glasses', 'Window Tints', 'Eye Drops'],
  'Floaters in Vision': ['Eye Vitamin Supplements', 'Vision Support Nutrients', 'Symptom Tracking Apps', 'Eye Exercises', 'Blue Light Filters', 'Computer Eye Strain Glasses', 'Lubricating Eye Drops', 'Vision Test Charts'],
  'Flashes of Light': ['Medical Alert Cards', 'Vision Support Supplements', 'Symptom Tracking Apps', 'Home Vision Tests', 'Blue Light Blocking Glasses', 'Eye Strain Relief Products', 'Lubricating Eye Drops', 'Vision Journals'],
  'Dry Eyes': ['Lubricating Eye Drops', 'Preservative-Free Tears', 'Eye Masks', 'Humidifiers', 'Omega-3 Supplements', 'Eye Vitamins', 'Hot Compresses', 'Computer Glasses', 'Screen Filters', 'Eyelid Cleansers'],
  'Eye Strain': ['Computer Glasses', 'Screen Filters', '20-20-20 Rule Reminder Apps', 'Lubricating Eye Drops', 'Adjustable Lighting', 'Reading Stands', 'Eye Exercises', 'Eye Vitamins', 'Warm Eye Compresses'],
  'Loss of Balance': ['Balance Training Tools', 'Walking Aids', 'Fall Prevention Products', 'Home Safety Modifications', 'Ginkgo Biloba', 'B12 Supplements', 'Exercise Guides', 'Medical Alert Systems', 'Vestibular Exercises'],
  'Loss of Coordination': ['Utensil Adaptations', 'Grip Assistance Tools', 'Button Hooks', 'Dressing Aids', 'Home Safety Products', 'Exercise Balls', 'Coordination Training Tools', 'Medical Alert Bracelets', 'Balance Trainers']
  
};

// 50+ Device recommendations
// Comprehensive device recommendations for 150+ symptoms
export const deviceRecommendations = {
  // Core symptoms from the existing data
  Fever: [
    { name: 'Digital Thermometer', brand: 'Omron', use: 'Measure body temperature accurately', link: 'https://www.omronhealthcare.com/thermometers' },
    { name: 'Infrared Thermometer', brand: 'Dr. Trust', use: 'Non-contact temperature check', link: 'https://drtrust.in/collections/thermometers' },
    { name: 'Forehead Strip Thermometer', brand: 'Johnson & Johnson', use: 'Quick temperature assessment', link: 'https://www.jnjconsumer.in/' },
    { name: 'Bluetooth Thermometer', brand: 'Kinsa', use: 'Track temperature with smartphone app', link: 'https://kinsahealth.com/' }
  ],
  Cough: [
    { name: 'Pulse Oximeter', brand: 'BPL', use: 'Monitor oxygen levels in blood', link: 'https://www.bplmedicaltechnologies.com/' },
    { name: 'Nebulizer', brand: 'Philips', use: 'Deliver medication to lungs for breathing issues', link: 'https://www.philips.co.in/healthcare/product/HCHS10/innospire-essence-compressor-nebulizer-system' },
    { name: 'Steam Inhaler', brand: 'Vicks', use: 'Provide warm moisture to ease congestion', link: 'https://vicks.com/en-us/shop-products/steam-products' },
    { name: 'Ultrasonic Humidifier', brand: 'Honeywell', use: 'Add moisture to air to reduce cough irritation', link: 'https://www.honeywellstore.com/store/products/honeywell-top-fill-digital-humidifier-with-humidistat-hcm-710.htm' }
  ],
  'Shortness of Breath': [
    { name: 'Pulse Oximeter', brand: 'Hesley', use: 'Track oxygen saturation levels', link: 'https://www.amazon.in/Hesley-Oximeter-Saturation-Perfusion-Batteries/dp/B087KJGMFG' },
    { name: 'Peak Flow Meter', brand: 'Cipla', use: 'Measure how fast air can be exhaled', link: 'https://www.1mg.com/otc/cipla-peak-flow-meter-otc330154' },
    { name: 'Portable Oxygen Concentrator', brand: 'Inogen', use: 'Supplemental oxygen for severe cases', link: 'https://www.inogen.com/' },
    { name: 'Spirometer', brand: 'Microlife', use: 'Measure lung function', link: 'https://www.microlife.com/medical/respiratory-care/spirometry' }
  ],
  'Chest Pain': [
    { name: 'BP Monitor', brand: 'Omron', use: 'Measure blood pressure', link: 'https://www.omronhealthcare.com/blood-pressure-monitors' },
    { name: 'ECG Monitor', brand: 'AliveCor', use: 'Track heart activity', link: 'https://www.alivecor.com/' },
    { name: 'Stethoscope', brand: 'Littmann', use: 'Listen to heart and lung sounds', link: 'https://www.littmann.com/' },
    { name: 'Heart Rate Monitor Watch', brand: 'Garmin', use: 'Continuous heart rate tracking', link: 'https://www.garmin.com/en-IN/c/wearables-smartwatches/' }
  ],


// Additional symptom device recommendations
Headache: [
  { name: 'TENS Unit', brand: 'Dr. Physio', use: 'Relieve tension headaches with electrical stimulation', link: 'https://www.drphysio.com/product-category/tens/' },
  { name: 'Acupressure Mat', brand: 'Spoonk', use: 'Relieve tension through pressure points', link: 'https://spoonkspace.com/' },
  { name: 'Head Massager', brand: 'Tezam', use: 'Release tension in scalp and head', link: 'https://www.amazon.in/TEZAM-Massager-Electric-Vibration-Relaxation/dp/B08CVCQG9F' },
  { name: 'Cooling Gel Pack', brand: 'IcePax', use: 'Reduce inflammation and pain', link: 'https://www.amazon.in/IcePax-Cooling-Reusable-Headache-Injuries/dp/B08F9ZJVK7' }
],
'Sore Throat': [
  { name: 'Throat Spray', brand: 'Difflam', use: 'Deliver targeted numbing medication', link: 'https://www.amazon.in/Difflam-Sore-Throat-Spray-30ml/dp/B0BF9KNKTS' },
  { name: 'Steam Inhaler', brand: 'Vicks', use: 'Provide soothing moisture to irritated tissue', link: 'https://vicks.com/en-us/shop-products/steam-products' },
  { name: 'Humidifier', brand: 'Honeywell', use: 'Keep air moist to prevent dryness', link: 'https://www.honeywellstore.com/store/category/humidifiers.htm' },
  { name: 'Throat Examination Light', brand: 'Dr. Mom', use: 'Examine throat at home for signs of infection', link: 'https://www.amazon.in/Dr-Mom-Throat-Examination-Scope/dp/B00FWP16PU' }
],
Fatigue: [
  { name: 'Fitness Tracker', brand: 'Fitbit', use: 'Monitor sleep and activity patterns', link: 'https://www.fitbit.com/global/in/home' },
  { name: 'Smart Sleep Tracker', brand: 'Withings', use: 'Analyze sleep quality and cycles', link: 'https://www.withings.com/us/en/sleep-analyzer' },
  { name: 'Light Therapy Lamp', brand: 'Verilux', use: 'Combat seasonal affective disorder', link: 'https://verilux.com/' },
  { name: 'Activity Monitor', brand: 'Garmin', use: 'Track daily activity levels', link: 'https://www.garmin.com/en-IN/c/wearables-smartwatches/' }
],
Nausea: [
  { name: 'Acupressure Wristband', brand: 'Sea-Band', use: 'Reduce nausea through pressure points', link: 'https://www.sea-band.com/' },
  { name: 'Essential Oil Diffuser', brand: 'Urpower', use: 'Disperse anti-nausea scents like peppermint', link: 'https://www.urpower.com/' },
  { name: 'Nausea Relief Drops', brand: 'UpSpring', use: 'Provide quick relief from nausea symptoms', link: 'https://www.upspringbaby.com/products/stomach-settle-nausea-relief-drops' },
  { name: 'Smart Water Bottle', brand: 'Hidrate', use: 'Maintain proper hydration during nausea', link: 'https://hidratespark.com/' }
],
'Abdominal Pain': [
  { name: 'Heating Pad', brand: 'Flamingo', use: 'Soothe abdominal discomfort with heat', link: 'https://www.flamingoindia.com/collections/hot-water-bottles' },
  { name: 'TENS Unit', brand: 'Omron', use: 'Pain relief through electrical stimulation', link: 'https://www.omronhealthcare.com/tens' },
  { name: 'Abdominal Support Belt', brand: 'Wonder Care', use: 'Provide support for abdominal muscles', link: 'https://www.amazon.in/Wonder-Care-abdominal-supporting-slimming/dp/B01N0K7SEZ' },
  { name: 'Therapeutic Massage Belt', brand: 'Caresmith', use: 'Relieve muscular tension in abdomen', link: 'https://www.amazon.in/CARESMITH-Massage-Slimming-Vibration-Circulation/dp/B07PDYF4V7' }
],
Dizziness: [
  { name: 'Ear Thermometer', brand: 'Braun', use: 'Check for fever-related causes of dizziness', link: 'https://www.braunhealthcare.com/in_en/thermometers' },
  { name: 'BP Monitor', brand: 'Omron', use: 'Check for low blood pressure', link: 'https://www.omronhealthcare.com/blood-pressure-monitors' },
  { name: 'Glucose Monitor', brand: 'Accu-Check', use: 'Check for low blood sugar', link: 'https://www.accu-chek.in/' },
  { name: 'Balance Training System', brand: 'TheraGear', use: 'Improve vestibular function', link: 'https://www.amazon.in/THERAGEAR-Balance-Board-Rehabilitation-Physiotherapy/dp/B078JLNP6P' }
],
Chills: [
  { name: 'Infrared Thermometer', brand: 'Dr. Trust', use: 'Monitor temperature without contact', link: 'https://drtrust.in/collections/thermometers' },
  { name: 'Thermal Blanket', brand: 'Medline', use: 'Retain body heat during chills', link: 'https://www.medline.com/product/Convertible-Thermal-Blankets/Z05-PF37023' },
  { name: 'Smart Temperature Monitor', brand: 'TempTraq', use: 'Continuous temperature monitoring', link: 'https://temptraq.com/' },
  { name: 'Heated Mattress Pad', brand: 'Sunbeam', use: 'Maintain warmth during recovery', link: 'https://www.sunbeam.com/heated-bedding/heated-mattress-pads/' }
],
'Joint Pain': [
  { name: 'Knee Brace', brand: 'Vissco', use: 'Support joint stability and reduce pain', link: 'https://www.vissco.com/products/orthopedic-supports/knee-ankle-foot/' },
  { name: 'Electric Massager', brand: 'JSB', use: 'Relieve muscle stiffness around joints', link: 'https://www.jsb.in/massagers.html' },
  { name: 'Hot/Cold Therapy Wrap', brand: 'Thermedic', use: 'Apply temperature therapy to affected joints', link: 'https://thermedic.com/' },
  { name: 'Compression Sleeves', brand: 'Tynor', use: 'Reduce inflammation and support joints', link: 'https://tynor.com/products/compression-sleeves' }
],
'Muscle Pain': [
  { name: 'Percussion Massage Gun', brand: 'Theragun', use: 'Deep tissue massage for muscle recovery', link: 'https://www.therabody.com/us/en-us/theragun.html' },
  { name: 'TENS/EMS Unit', brand: 'Compex', use: 'Electrical stimulation for pain relief and muscle recovery', link: 'https://www.compexstore.com/' },
  { name: 'Foam Roller', brand: 'TriggerPoint', use: 'Self-myofascial release for tight muscles', link: 'https://www.tptechnology.com/' },
  { name: 'Infrared Heat Therapy Wrap', brand: 'UTK', use: 'Deep penetrating heat for muscle relaxation', link: 'https://utktechnology.com/' }
],
Rash: [
  { name: 'Skin Scanner', brand: 'DermaScope', use: 'Examine skin conditions in detail', link: 'https://www.dermascope.com/' },
  { name: 'UV Protection Meter', brand: 'Solarmeter', use: 'Measure UV exposure for sensitive skin', link: 'https://www.solarmeter.com/' },
  { name: 'Skin Moisture Analyzer', brand: 'Derma H20', use: 'Assess skin hydration levels', link: 'https://www.amazon.in/XINDAO-Moisture-Analyzer-Portable-Bluetooth/dp/B0BRVQ2YVG' },
  { name: 'Cool Mist Humidifier', brand: 'Levoit', use: 'Maintain optimal humidity for skin health', link: 'https://www.levoit.com/humidifiers' }
],
Itching: [
  { name: 'HEPA Air Purifier', brand: 'Dyson', use: 'Remove airborne allergens causing itching', link: 'https://www.dyson.in/air-purifiers' },
  { name: 'Skin Humidity Meter', brand: 'H2O+', use: 'Measure skin moisture levels', link: 'https://www.amazon.in/Skin-Moisture-Meter/s?k=Skin+Moisture+Meter' },
  { name: 'Cooling Therapy Device', brand: 'Soothly', use: 'Apply cold therapy to reduce itching', link: 'https://www.amazon.in/Soothly-Therapy-Device-Itching-Relief/dp/B08H86XCPJ' },
  { name: 'Anti-Allergy Bedding', brand: 'AllerEase', use: 'Reduce exposure to dust mites and allergens', link: 'https://www.allerease.com/' }
],
Palpitations: [
  { name: 'Portable ECG Monitor', brand: 'KardiaMobile', use: 'Record heart rhythm during palpitation episodes', link: 'https://www.alivecor.com/' },
  { name: 'Heart Rate Monitor Watch', brand: 'Polar', use: 'Track heart rate patterns and variability', link: 'https://www.polar.com/en' },
  { name: 'Holter Monitor', brand: 'Contec', use: 'Record heart activity for 24-48 hours', link: 'https://www.contecmed.com/product/show/55' },
  { name: 'Blood Pressure Monitor', brand: 'Omron', use: 'Check BP changes during palpitations', link: 'https://www.omronhealthcare.com/blood-pressure-monitors' }
],
Diarrhea: [
  { name: 'Stool Sample Collection Kit', brand: 'EasySampler', use: 'Collect samples for testing if persistent', link: 'https://www.amazon.in/Stool-Sample-Collection-Kit/s?k=Stool+Sample+Collection+Kit' },
  { name: 'Smart Water Bottle', brand: 'Hidrate', use: 'Track hydration to prevent dehydration', link: 'https://hidratespark.com/' },
  { name: 'Electrolyte Analyzer', brand: 'NUTR', use: 'Monitor electrolyte levels in saliva', link: 'https://www.amazon.in/Electrolyte-Analyzer/s?k=Electrolyte+Analyzer' },
  { name: 'Toilet Analyzer', brand: 'Toto', use: 'Assess health indicators in stool', link: 'https://www.totousa.com/products/toilets' }
],
Constipation: [
  { name: 'Biofeedback Device', brand: 'PelvicTech', use: 'Improve bowel function through training', link: 'https://www.amazon.in/s?k=pelvic+floor+biofeedback+device' },
  { name: 'Squatty Potty', brand: 'Squatty Potty', use: 'Improve posture for easier bowel movements', link: 'https://www.squattypotty.com/' },
  { name: 'Abdominal Massage Device', brand: 'Naipo', use: 'Stimulate intestinal movement', link: 'https://www.naipocare.com/' },
  { name: 'Hydration Reminder Bottle', brand: 'Hidrate', use: 'Ensure adequate fluid intake', link: 'https://hidratespark.com/' }
],
Vomiting: [
  { name: 'Nausea Relief Wristband', brand: 'Sea-Band', use: 'Apply acupressure to reduce vomiting', link: 'https://www.sea-band.com/' },
  { name: 'Electrolyte Analyzer', brand: 'NUTR', use: 'Monitor electrolyte imbalances from vomiting', link: 'https://www.amazon.in/Electrolyte-Analyzer/s?k=Electrolyte+Analyzer' },
  { name: 'Smart Water Bottle', brand: 'Hidrate', use: 'Track fluid intake for rehydration', link: 'https://hidratespark.com/' },
  { name: 'Digital Scale', brand: 'Withings', use: 'Monitor weight loss from fluid loss', link: 'https://www.withings.com/us/en/scales' }
],
'Loss of Appetite': [
  { name: 'Smart Food Scale', brand: 'Etekcity', use: 'Track food intake amounts', link: 'https://www.etekcity.com/product/100385' },
  { name: 'Nutrition Tracker', brand: 'Fitbit', use: 'Monitor nutritional intake', link: 'https://www.fitbit.com/global/in/home' },
  { name: 'Aroma Diffuser', brand: 'InnoGear', use: 'Stimulate appetite with scents', link: 'https://www.innogear.com/products/innogear-upgraded-150ml-aromatherapy-diffuser' },
  { name: 'Body Composition Analyzer', brand: 'Tanita', use: 'Monitor nutritional status', link: 'https://www.tanita.com/en/body-composition-analyzers/' }
],
'Weight Loss': [
  { name: 'Smart Scale', brand: 'Withings', use: 'Track weight and body composition changes', link: 'https://www.withings.com/us/en/scales' },
  { name: 'Body Fat Analyzer', brand: 'Omron', use: 'Monitor body composition changes', link: 'https://www.omronhealthcare.com/body-composition-monitors' },
  { name: 'Food Scale', brand: 'OXO', use: 'Measure food portions accurately', link: 'https://www.oxo.com/categories/cooking-and-baking/tools/measuring/food-scales.html' },
  { name: 'Metabolism Tracker', brand: 'Lumen', use: 'Measure metabolic rate through breath', link: 'https://www.lumen.me/' }
],
'Weight Gain': [
  { name: 'Smart Scale', brand: 'Renpho', use: 'Track weight gain progress', link: 'https://renpho.com/collections/scale' },
  { name: 'Muscle Mass Monitor', brand: 'InBody', use: 'Distinguish between muscle and fat gain', link: 'https://inbodyusa.com/' },
  { name: 'Fitness Tracker', brand: 'Garmin', use: 'Monitor activity and calorie burn', link: 'https://www.garmin.com/en-IN/c/wearables-smartwatches/' },
  { name: 'Smart Water Bottle', brand: 'Hidrate', use: 'Track hydration for optimal nutrition absorption', link: 'https://hidratespark.com/' }
],
'Night Sweats': [
  { name: 'Temperature Regulating Mattress Pad', brand: 'ChiliSleep', use: 'Control bed temperature during sleep', link: 'https://www.chilisleep.com/' },
  { name: 'Sleep Temperature Monitor', brand: 'Eight Sleep', use: 'Track body temperature during sleep', link: 'https://www.eightsleep.com/' },
  { name: 'Moisture-Wicking Bedding', brand: 'Slumber Cloud', use: 'Manage night sweat moisture', link: 'https://www.slumbercloud.com/' },
  { name: 'Room Environment Monitor', brand: 'Netatmo', use: 'Track bedroom temperature and humidity', link: 'https://www.netatmo.com/en-us' }
],
'Swollen Lymph Nodes': [
  { name: 'Digital Caliper', brand: 'VINCA', use: 'Measure size of lymph nodes accurately', link: 'https://www.amazon.in/VINCA-DCLA-0605-Electronic-Fractions-Conversion/dp/B017KUC6XQ' },
  { name: 'Infrared Thermometer', brand: 'Braun', use: 'Check for localized temperature increases', link: 'https://www.braunhealthcare.com/in_en/thermometers' },
  { name: 'Lymphatic Drainage Massage Device', brand: 'FasciaBlaster', use: 'Gentle massage for lymphatic system', link: 'https://www.fasciablaster.com/' },
  { name: 'Ultrasound Imaging Device', brand: 'Butterfly iQ', use: 'Home imaging of lymph nodes (requires professional interpretation)', link: 'https://www.butterflynetwork.com/' }
],
Sleeplessness: [
  { name: 'Sleep Monitor', brand: 'Withings', use: 'Track sleep patterns and quality', link: 'https://www.withings.com/us/en/sleep' },
  { name: 'White Noise Machine', brand: 'Homedics', use: 'Create optimal sound environment for sleep', link: 'https://www.homedics.com/sound-machines/' },
  { name: 'Light Therapy Glasses', brand: 'Luminette', use: 'Regulate circadian rhythm', link: 'https://www.myluminette.com/' },
  { name: 'Sleep Quality Monitor', brand: 'Beddit', use: 'Track sleep stages throughout the night', link: 'https://www.beddit.com/' }
],
'Excessive Sleepiness': [
  { name: 'Wake-Up Light', brand: 'Philips', use: 'Gradually increase light to ease awakening', link: 'https://www.usa.philips.com/c-m-li/light-therapy/wake-up-light/' },
  { name: 'Sleep Apnea Monitor', brand: 'ResMed', use: 'Check for sleep-disordered breathing', link: 'https://www.resmed.com/' },
  { name: 'Alertness Monitor', brand: 'Dreem', use: 'Track daytime alertness levels', link: 'https://dreem.com/' },
  { name: 'Light Therapy Glasses', brand: 'Re-Timer', use: 'Reset circadian rhythm', link: 'https://re-timer.com/' }
],
'Blur of Vision': [
  { name: 'Eye Massager', brand: 'iCare', use: 'Relieve eye strain with gentle massage', link: 'https://www.amazon.in/iCare-Electric-Cordless-Rechargeable-Massager/dp/B09MCTKHDW' },
  { name: 'Visual Acuity Chart', brand: 'Snellen', use: 'Self-monitor vision changes', link: 'https://www.amazon.in/Snellen-Distance-Vision-Testing-Charts/dp/B08G1DKQY2' },
  { name: 'Eye Drops Dispenser', brand: 'OptiDrop', use: 'Precisely administer eye drops', link: 'https://www.eyedrop.com/' },
  { name: 'Blue Light Blocking Glasses', brand: 'Gunnar', use: 'Reduce digital eye strain', link: 'https://gunnar.com/' }
],
'Eye Pain': [
  { name: 'Cooling Eye Mask', brand: 'Bruder', use: 'Reduce inflammation and pain', link: 'https://www.bruder.com/eye-care/' },
  { name: 'Light Sensitivity Glasses', brand: 'TheraSpecs', use: 'Filter painful light frequencies', link: 'https://www.theraspecs.com/' },
  { name: 'Eye Pressure Monitor', brand: 'iCare', use: 'Check intraocular pressure at home', link: 'https://www.icare-world.com/products/icare-home/' },
  { name: 'Eye Drops Timer', brand: 'TimerCap', use: 'Track medication schedule', link: 'https://www.timercap.com/' }
],
'Hearing Loss': [
  { name: 'Home Hearing Test Kit', brand: 'MDHearingAid', use: 'Basic hearing assessment', link: 'https://www.mdhearingaid.com/' },
  { name: 'Sound Amplifier', brand: 'Etymotic', use: 'Boost environmental sounds', link: 'https://www.etymotic.com/' },
  { name: 'TV Sound Enhancer', brand: 'TV Ears', use: 'Improve television audio clarity', link: 'https://www.tvears.com/' },
  { name: 'Captioning Phone', brand: 'CapTel', use: 'See text captions of phone conversations', link: 'https://www.captel.com/' }
],
Earache: [
  { name: 'Otoscope', brand: 'Dr. Morepen', use: 'Examine ear canal for issues', link: 'https://www.morepen.com/otoscopes' },
  { name: 'Ear Irrigation System', brand: 'Elephant Ear', use: 'Safe ear cleaning at home', link: 'https://www.elephantear.com/' },
  { name: 'Ear Thermometer', brand: 'Braun', use: 'Temperature measurement via ear', link: 'https://www.braunhealthcare.com/in_en/thermometers' },
  { name: 'Hearing Amplifier', brand: 'Banglijian', use: 'Temporary hearing assistance', link: 'https://www.amazon.in/Banglijian-Amplifier-Rechargeable-Technology-Cancelling/dp/B07TS83QDM' }
],
Tinnitus: [
  { name: 'White Noise Generator', brand: 'LectroFan', use: 'Mask tinnitus sounds for better sleep', link: 'https://www.soundofsleep.com/lectrofan/' },
  { name: 'Hearing Aid with Tinnitus Masker', brand: 'Phonak', use: 'Combined hearing improvement and tinnitus relief', link: 'https://www.phonak.com/' },
  { name: 'Tinnitus Relief App Device', brand: 'Otoharmonics', use: 'Deliver sound therapy via app', link: 'https://www.otoharmonics.com/' },
  { name: 'Sound Therapy Pillow', brand: 'Sound Oasis', use: 'Deliver masking sounds during sleep', link: 'https://www.soundoasis.com/' }
],
Nosebleed: [
  { name: 'Humidifier', brand: 'Vicks', use: 'Prevent nasal dryness that leads to bleeding', link: 'https://vicks.com/en-us/shop-products/humidifiers' },
  { name: 'Nasal Moisture Monitor', brand: 'AcuRite', use: 'Track room humidity levels', link: 'https://www.acurite.com/' },
  { name: 'Epistaxis Kit', brand: 'RhinoChill', use: 'Specialized tools for nosebleed management', link: 'https://www.amazon.in/s?k=nosebleed+kit' },
  { name: 'Nasal Cautery Device', brand: 'HemoCue', use: 'Seal bleeding vessels (medical supervision required)', link: 'https://www.hemocue.com/' }
],
'Runny Nose': [
  { name: 'Nasal Irrigation System', brand: 'NeilMed', use: 'Cleanse nasal passages', link: 'https://www.neilmed.com/' },
  { name: 'Handheld Steam Inhaler', brand: 'Vicks', use: 'Loosen congestion with warm moisture', link: 'https://vicks.com/en-us/shop-products/steam-products' },
  { name: 'Pollen Counter', brand: 'Awair', use: 'Monitor allergen levels that trigger symptoms', link: 'https://getawair.com/' },
  { name: 'Tissues with Moisturizer', brand: 'Puffs', use: 'Prevent nasal irritation from frequent wiping', link: 'https://www.puffs.com/' }
],
Sneezing: [
  { name: 'HEPA Air Purifier', brand: 'BlueAir', use: 'Remove airborne allergens triggering sneezing', link: 'https://www.blueair.com/in' },
  { name: 'Allergen Detector', brand: 'Sensio AIR', use: 'Identify specific allergens in environment', link: 'https://www.sensioair.com/' },
  { name: 'Nasal Filters', brand: 'Rhinix', use: 'Block allergens from entering nasal passages', link: 'https://rhinix.com/' },
  { name: 'Humidity Monitor', brand: 'ThermoPro', use: 'Maintain optimal humidity to reduce irritation', link: 'https://buythermopro.com/' }
],
'Swollen Ankles': [
{ name: 'Compression Socks', brand: 'Sigvaris', use: 'Improve circulation in lower extremities', link: 'https://www.sigvaris.com/' },
{ name: 'Foot Elevation Pillow', brand: 'Lounge Doctor', use: 'Proper elevation to reduce ankle swelling', link: 'https://www.loungedoctor.com/' },
{ name: 'Cold Therapy Wrap', brand: 'TheraPAQ', use: 'Reduce inflammation and swelling using cold therapy', link: 'https://therapaq.com/products/ankle-wrap' },
{ name: 'Ankle Support Brace', brand: 'McDavid', use: 'Provide support and compression for swollen ankles', link: 'https://www.mcdavidusa.com/products/ankle-brace' }


],

  'Dark Urine': [
  { name: 'Urine Color Analyzer', brand: 'UriColor', use: 'Document and compare urine color changes', link: 'https://www.amazon.in/s?k=urine+color+chart' },
  { name: 'Hydration Monitor', brand: 'Hidrate', use: 'Track fluid intake affecting urine color', link: 'https://hidratespark.com/' },
  { name: 'Urinalysis Test Kit', brand: 'Mission', use: 'Check for bilirubin and other compounds', link: 'https://www.acon-labs.com/' },
  { name: 'Liver Function Test', brand: 'EverlyWell', use: 'Check liver parameters affecting urine color', link: 'https://www.everlywell.com/' }
],
'Cloudy Urine': [
  { name: 'Urine Clarity Analyzer', brand: 'ClarTest', use: 'Document changes in urine clarity', link: 'https://www.amazon.in/s?k=urine+test+kit' },
  { name: 'UTI Test Kit', brand: 'AZO', use: 'Test for infection causing cloudiness', link: 'https://www.azoproducts.com/' },
  { name: 'Digital Microscope', brand: 'Depstech', use: 'Examine urine sediment', link: 'https://www.depstech.com/' },
  { name: 'Kidney Stone Risk Test', brand: 'Litholink', use: 'Check risk factors for crystals in urine', link: 'https://www.labcorp.com/litholink' }
],
'Foamy Urine': [
  { name: 'Urine Protein Test Kit', brand: 'Mission', use: 'Check for protein causing foam', link: 'https://www.acon-labs.com/' },
  { name: 'Kidney Function Test', brand: 'EverlyWell', use: 'Check kidney parameters', link: 'https://www.everlywell.com/' },
  { name: 'Digital Food Scale', brand: 'Etekcity', use: 'Monitor protein intake in diet', link: 'https://www.etekcity.com/' },
  { name: 'Blood Pressure Monitor', brand: 'Omron', use: 'Track BP affecting kidney function', link: 'https://www.omronhealthcare.com/' }
],
'Foul-Smelling Urine': [
  { name: 'Electronic Nose', brand: 'Cyranose', use: 'Analyze urine odor compounds', link: 'https://www.amazon.in/s?k=electronic+nose' },
  { name: 'UTI Test Kit', brand: 'AZO', use: 'Check for infection affecting odor', link: 'https://www.azoproducts.com/' },
  { name: 'Hydration Reminder Bottle', brand: 'Hidrate', use: 'Ensure adequate hydration', link: 'https://hidratespark.com/' },
  { name: 'Diabetes Test Kit', brand: 'OneTouch', use: 'Check glucose affecting urine smell', link: 'https://www.onetouch.com/' }
],
'Bedwetting': [
  { name: 'Bedwetting Alarm', brand: 'DryNites', use: 'Alert at first moisture to train response', link: 'https://www.drynites.com/' },
  { name: 'Moisture-Sensing Sheet', brand: 'DryBuddy', use: 'Detect wetness and provide alert', link: 'https://drybuddy.com/' },
  { name: 'Bladder Capacity Monitor', brand: 'TheraPee', use: 'Track and improve bladder capacity', link: 'https://www.therapee.com/' },
  { name: 'Sleep Position Monitor', brand: 'Withings', use: 'Correlate position with bedwetting episodes', link: 'https://www.withings.com/' }
],
'Double Vision': [
  { name: 'Computer Vision Therapy System', brand: 'HTS', use: 'Train eye coordination', link: 'https://homevisiontherapy.com/' },
  { name: 'Eye Tracking Device', brand: 'Tobii', use: 'Measure eye movement coordination', link: 'https://www.tobii.com/' },
  { name: 'Prism Lens Measurement Kit', brand: 'Fresnel', use: 'Try different prism strengths', link: 'https://www.fresnelprism.com/' },
  { name: 'Visual Field Test Device', brand: 'VisionField', use: 'Map areas of double vision', link: 'https://www.amazon.in/s?k=visual+field+test' }
],
'Night Blindness': [
  { name: 'Dark Adaptation Tester', brand: 'AdaptDx', use: 'Measure night vision capability', link: 'https://maculogix.com/adaptdx/' },
  { name: 'Light Sensitivity Glasses', brand: 'Noir', use: 'Enhance night vision with specialized lenses', link: 'https://www.noir-medical.com/' },
  { name: 'Vitamin A Testing Kit', brand: 'EverlyWell', use: 'Check levels affecting night vision', link: 'https://www.everlywell.com/' },
  { name: 'Portable Night Vision Enhancer', brand: 'NightVue', use: 'Amplify available light for safer navigation', link: 'https://www.amazon.in/s?k=night+vision+monocular' }
],
'Sensitivity to Light': [
  { name: 'Light Sensitivity Meter', brand: 'LuxIQ', use: 'Measure personal light tolerance', link: 'https://www.eyecomfort.com/' },
  { name: 'FL-41 Tinted Glasses', brand: 'TheraSpecs', use: 'Filter problematic light wavelengths', link: 'https://www.theraspecs.com/' },
  { name: 'Light Adjusting Glasses', brand: 'Transitions', use: 'Automatically adapt to light conditions', link: 'https://www.transitions.com/' },
  { name: 'Environment Light Monitor', brand: 'Awair', use: 'Track light levels in surroundings', link: 'https://getawair.com/' }
],
'Floaters in Vision': [
  { name: 'Floater Visualization Tool', brand: 'I-Relief', use: 'Document floater patterns and changes', link: 'https://www.amazon.in/s?k=floater+visualization+tool' },
  { name: 'Retinal Scanner', brand: 'EyeQue', use: 'Self-check of retinal health', link: 'https://www.eyeque.com/' },
  { name: 'Vitreous Health Supplement Dispenser', brand: 'PillDrill', use: 'Track supplement regimen', link: 'https://www.pilldrill.com/' },
  { name: 'Visual Field Mapper', brand: 'Viewplot', use: 'Map locations and density of floaters', link: 'https://www.amazon.in/s?k=visual+field+test' }
],
'Flashes of Light': [
  { name: 'Retinal Health Monitor', brand: 'EyeQue', use: 'Track retinal changes', link: 'https://www.eyeque.com/' },
  { name: 'Visual Field Mapper', brand: 'Viewplot', use: 'Document location and pattern of flashes', link: 'https://www.amazon.in/s?k=visual+field+test' },
  { name: 'Blood Pressure Monitor', brand: 'Omron', use: 'Check for BP affecting ocular blood flow', link: 'https://www.omronhealthcare.com/' },
  { name: 'Medical Alert Bracelet', brand: 'MedicAlert', use: 'Emergency information for retinal concerns', link: 'https://www.medicalert.org/' }
],
'Dry Eyes': [
  { name: 'Tear Osmolarity Test', brand: 'TearLab', use: 'Measure tear quality at home', link: 'https://www.tearlab.com/' },
  { name: 'Meibomian Gland Warmer', brand: 'Bruder', use: 'Stimulate oil gland function', link: 'https://www.bruder.com/' },
  { name: 'Blink Rate Monitor', brand: 'Eyetracker', use: 'Track blinking pattern changes', link: 'https://www.tobii.com/' },
  { name: 'Eye Hydration Monitor', brand: 'OCULUS', use: 'Measure tear film break-up time', link: 'https://www.oculus.de/en/' }
],
'Eye Strain': [
  { name: 'Blue Light Filter Glasses', brand: 'Gunnar', use: 'Reduce digital screen strain', link: 'https://gunnar.com/' },
  { name: 'Vision Training System', brand: 'Vivid Vision', use: 'Exercises for eye fatigue', link: 'https://www.seevividly.com/' },
  { name: 'Screen Distance Monitor', brand: 'Eyeguard', use: 'Alert to improper viewing distances', link: 'https://www.amazon.in/s?k=screen+distance+monitor' },
  { name: 'Blink Reminder Device', brand: 'Eyepeace', use: 'Prompt regular blinking during screen use', link: 'https://www.amazon.in/s?k=blink+reminder' }
],
'Loss of Balance': [
  { name: 'Balance Assessment System', brand: 'Biodex', use: 'Measure and track balance ability', link: 'https://www.biodex.com/' },
  { name: 'Vestibular Rehabilitation Device', brand: 'Vertigo VR', use: 'Home exercises for vestibular issues', link: 'https://www.amazon.in/s?k=vestibular+rehabilitation' },
  { name: 'Gait Analysis System', brand: 'Tekscan', use: 'Analyze walking stability', link: 'https://www.tekscan.com/' },
  { name: 'Fall Detection Device', brand: 'FallSafety', use: 'Alert when falls occur', link: 'https://www.fallsafetyapp.com/' }
],
'Loss of Coordination': [
  { name: 'Fine Motor Skills Trainer', brand: 'Dexterity', use: 'Exercises to improve coordination', link: 'https://www.amazon.in/s?k=fine+motor+skills+trainer' },
  { name: 'Movement Analysis System', brand: 'Xsens', use: 'Detailed analysis of motion patterns', link: 'https://www.xsens.com/' },
  { name: 'Handwriting Analysis Tool', brand: 'Stabilo', use: 'Track changes in fine motor control', link: 'https://www.stabilo.com/' },
  { name: 'Coordination Exercise Device', brand: 'NeuroGym', use: 'Targeted exercises for coordination', link: 'https://www.neurogymfitness.com/' }
], 
'Flatulence': [
  { name: 'Digestive Gas Monitor', brand: 'FoodMarble', use: 'Track foods causing gas', link: 'https://foodmarble.com/' },
  { name: 'Microbiome Test Kit', brand: 'Viome', use: 'Analyze gut bacteria affecting gas', link: 'https://www.viome.com/' },
  { name: 'Food Intolerance Test', brand: 'EverlyWell', use: 'Identify gas-causing foods', link: 'https://www.everlywell.com/' },
  { name: 'Activated Charcoal Dispenser', brand: 'CharcoCaps', use: 'Precise dosing of gas-absorbing supplements', link: 'https://www.amazon.in/s?k=charcoal+capsules' }
],
'Incontinence': [
  { name: 'Bladder Scanner', brand: 'Verathon', use: 'Measure bladder volume and emptying', link: 'https://www.verathon.com/bladderscanner/' },
  { name: 'Pelvic Floor Trainer', brand: 'Elvie', use: 'Strengthen controlling muscles', link: 'https://www.elvie.com/' },
  { name: 'Incontinence Monitor', brand: 'DFree', use: 'Predict and alert to bladder fullness', link: 'https://www.dfreeus.biz/' },
  { name: 'Biofeedback System', brand: 'PeriCoach', use: 'Visual feedback for muscle training', link: 'https://www.pericoach.com/' }
],
'Low Back Pain': [
  { name: 'Posture Monitor', brand: 'Upright', use: 'Alert to posture affecting back pain', link: 'https://www.uprightpose.com/' },
  { name: 'Digital TENS Unit', brand: 'iReliev', use: 'Electrical stimulation therapy', link: 'https://ireliev.com/' },
  { name: 'Smart Lumbar Support', brand: 'Cybertech', use: 'Adjustable support with feedback', link: 'https://www.cybertechmedical.com/' },
  { name: 'Back Stretching Device', brand: 'BackBridge', use: 'Guided back extension therapy', link: 'https://www.amazon.in/s?k=back+stretcher' }
],
'Swollen Glands': [
  { name: 'Digital Caliper', brand: 'Mitutoyo', use: 'Measure lymph node size changes', link: 'https://www.mitutoyo.com/' },
  { name: 'Infrared Thermometer', brand: 'Braun', use: 'Check for localized temperature increases', link: 'https://www.braunhealthcare.com/' },
  { name: 'Lymphatic Drainage Device', brand: 'Theragun', use: 'Gentle lymphatic stimulation', link: 'https://www.therabody.com/' },
  { name: 'Immune Support Monitor', brand: 'VitaCheck', use: 'Track immune markers at home', link: 'https://www.amazon.in/s?k=immune+health+monitor' }
],
'Skin Ulcers': [
  { name: 'Wound Measurement Device', brand: 'eKare', use: '3D wound assessment and tracking', link: 'https://ekare.ai/' },
  { name: 'Hyperspectral Imaging Camera', brand: 'HyperMed', use: 'Analyze tissue oxygenation', link: 'https://www.hypermed.com/' },
  { name: 'Smart Wound Dressing', brand: 'Molnlycke', use: 'Monitor healing environment', link: 'https://www.molnlycke.com/' },
  { name: 'Pressure Mapping System', brand: 'XSENSOR', use: 'Identify pressure points causing ulcers', link: 'https://www.xsensor.com/' }
],
'Genital Sores': [
  { name: 'Digital Dermatoscope', brand: 'DermLite', use: 'Close examination of lesions', link: 'https://dermlite.com/' },
  { name: 'Home STI Test Kit', brand: 'EverlyWell', use: 'Screen for common infections', link: 'https://www.everlywell.com/' },
  { name: 'Healing Progress Camera', brand: 'Depstech', use: 'Document healing over time', link: 'https://www.depstech.com/' },
  { name: 'Lysine Dispenser Timer', brand: 'PillDrill', use: 'Track supplement usage for herpes management', link: 'https://www.pilldrill.com/' }
],
'Excessive Gas': [
  { name: 'Gut Fermentation Monitor', brand: 'FoodMarble', use: 'Identify foods causing fermentation', link: 'https://foodmarble.com/' },
  { name: 'Microbiome Analysis Kit', brand: 'Viome', use: 'Comprehensive gut bacteria assessment', link: 'https://www.viome.com/' },
  { name: 'Abdominal Massage Device', brand: 'Naipo', use: 'Stimulate gas release', link: 'https://www.naipocare.com/' },
  { name: 'Food Intolerance Test', brand: 'EverlyWell', use: 'Identify gas-producing food triggers', link: 'https://www.everlywell.com/' }
],
'Indigestion': [
  { name: 'Digestive Tracking System', brand: 'Cara Care', use: 'Identify patterns triggering indigestion', link: 'https://cara.care/' },
  { name: 'Digital pH Meter', brand: 'Apera', use: 'Test stomach acid levels in saliva', link: 'https://aperainst.com/' },
  { name: 'Esophageal Pressure Monitor', brand: 'Sandhill', use: 'Track acid reflux events', link: 'https://www.sandhillsci.com/' },
  { name: 'Smart Food Journal', brand: 'Ate', use: 'Connect food choices to symptoms', link: 'https://www.amazon.in/s?k=smart+food+journal' }
],
'Reduced Appetite': [
  { name: 'Appetite Tracking Scale', brand: 'Etekcity', use: 'Monitor food intake amounts', link: 'https://www.etekcity.com/' },
  { name: 'Nutrition Analyzer', brand: 'Foodsniffer', use: 'Check food freshness affecting appetite', link: 'https://www.myfoodsniffer.com/' },
  { name: 'Zinc Status Test', brand: 'EverlyWell', use: 'Check zinc levels affecting taste/appetite', link: 'https://www.everlywell.com/' },
  { name: 'Aromatherapy Diffuser', brand: 'Vitruvi', use: 'Use scents to stimulate appetite', link: 'https://vitruvi.com/' }
],
'Difficulty Breathing': [
  { name: 'Portable Spirometer', brand: 'MIR', use: 'Measure lung function changes', link: 'https://www.spirometry.com/' },
  { name: 'Pulse Oximeter', brand: 'Nonin', use: 'Track blood oxygen levels', link: 'https://www.nonin.com/' },
  { name: 'Smart Inhaler', brand: 'Propeller', use: 'Track medication usage and effectiveness', link: 'https://www.propellerhealth.com/' },
  { name: 'Respiratory Muscle Trainer', brand: 'PowerBreathe', use: 'Strengthen breathing muscles', link: 'https://www.powerbreathe.com/' }
],
'Shortness of Breath at Night': [
  { name: 'Sleep Position Monitor', brand: 'Withings', use: 'Track positions affecting breathing', link: 'https://www.withings.com/' },
  { name: 'Overnight Pulse Oximeter', brand: 'Wellue', use: 'Monitor oxygen levels during sleep', link: 'https://getwellue.com/' },
  { name: 'Adjustable Bed System', brand: 'Sleep Number', use: 'Optimal positioning for breathing', link: 'https://www.sleepnumber.com/' },
  { name: 'Air Quality Monitor', brand: 'Awair', use: 'Check for nighttime triggers', link: 'https://getawair.com/' }
],
'Dizziness When Standing': [
  { name: 'Continuous BP Monitor', brand: 'Omron', use: 'Record BP changes when standing', link: 'https://www.omronhealthcare.com/' },
  { name: 'Balance Assessment System', brand: 'Biodex', use: 'Measure stability changes', link: 'https://www.biodex.com/' },
  { name: 'Sodium/Electrolyte Analyzer', brand: 'HORIBA', use: 'Check electrolyte balance affecting BP', link: 'https://www.horiba.com/' },
  { name: 'Hydration Monitor', brand: 'Hidrate', use: 'Track fluid intake affecting orthostatic BP', link: 'https://hidratespark.com/' }
],
'Leg Pain': [
  { name: 'Circulation Monitor', brand: 'Withings', use: 'Check blood flow to legs', link: 'https://www.withings.com/' },
  { name: 'Compression Therapy System', brand: 'Normatec', use: 'Improve circulation and reduce pain', link: 'https://www.hyperice.com/normatec' },
  { name: 'TENS/EMS Unit', brand: 'Compex', use: 'Electrical stimulation for pain relief', link: 'https://www.compexstore.com/' },
  { name: 'Infrared Thermography', brand: 'FLIR', use: 'Identify inflammation patterns', link: 'https://www.flir.com/' }
],
'Mood Swings': [
  { name: 'Mood Tracking Device', brand: 'Moodbeam', use: 'Log and analyze mood patterns', link: 'https://moodbeam.co.uk/' },
  { name: 'Light Therapy Glasses', brand: 'Luminette', use: 'Regulate circadian rhythm affecting mood', link: 'https://www.myluminette.com/' },
  { name: 'Hormone Testing Kit', brand: 'EverlyWell', use: 'Check hormone fluctuations affecting mood', link: 'https://www.everlywell.com/' },
  { name: 'Heart Rate Variability Monitor', brand: 'Oura', use: 'Track stress levels affecting mood', link: 'https://ouraring.com/' }
],
'Panic Attacks': [
  { name: 'Biofeedback Device', brand: 'Pip', use: 'Track and reduce stress responses', link: 'https://thepip.com/' },
  { name: 'Breathing Guidance Device', brand: 'Spire', use: 'Normalize breathing patterns during attacks', link: 'https://spirehealth.com/' },
  { name: 'Tactile Grounding Device', brand: 'TouchPoints', use: 'Haptic stimulation to reduce panic', link: 'https://thetouchpointssolution.com/' },
  { name: 'Heart Rate Alert Watch', brand: 'Garmin', use: 'Alert to increased heart rate', link: 'https://www.garmin.com/' }
],
'Obsessive Thoughts': [
  { name: 'Cognitive Training System', brand: 'FOCUS', use: 'Mental exercises for thought management', link: 'https://www.amazon.in/s?k=cognitive+training+device' },
  { name: 'Meditation Headband', brand: 'Muse', use: 'Guide meditation for thought reduction', link: 'https://choosemuse.com/' },
  { name: 'Thought Recording Device', brand: 'ThoughtDiary', use: 'Externalize thoughts through recording', link: 'https://www.amazon.in/s?k=digital+voice+recorder' },
  { name: 'Tactile Distraction Tool', brand: 'Tangle', use: 'Physical focus to interrupt thought patterns', link: 'https://www.tanglecreations.com/' }
],
'Racing Thoughts': [
  { name: 'Neurofeedback Device', brand: 'Muse', use: 'Visual feedback of brain activity', link: 'https://choosemuse.com/' },
  { name: 'White Noise Generator', brand: 'LectroFan', use: 'Mask distracting thoughts with ambient sound', link: 'https://www.soundofsleep.com/' },
  { name: 'Sleep Sound System', brand: 'Hatch', use: 'Guided relaxation for thought slowing', link: 'https://www.hatch.co/' },
  { name: 'Weighted Blanket', brand: 'Gravity', use: 'Apply calming pressure to reduce thought racing', link: 'https://gravityblankets.com/' }
],
'Excessive Worry': [
  { name: 'Anxiety Monitor', brand: 'Spire', use: 'Track breathing patterns indicating worry', link: 'https://spirehealth.com/' },
  { name: 'Heart Rate Variability Trainer', brand: 'HeartMath', use: 'Guide into coherent heart patterns', link: 'https://www.heartmath.com/' },
  { name: 'CBT Training Device', brand: 'Woebot', use: 'Cognitive behavioral therapy exercises', link: 'https://woebothealth.com/' },
  { name: 'Biofeedback Stress Monitor', brand: 'Pip', use: 'Visualize and reduce stress levels', link: 'https://thepip.com/' }
],
'Hallucinations': [
  { name: 'Reality Testing Recorder', brand: 'VoiceAware', use: 'Record environment for reality checking', link: 'https://www.amazon.in/s?k=portable+voice+recorder' },
  { name: 'Blood Glucose Monitor', brand: 'FreeStyle', use: 'Check for low sugar causing hallucinations', link: 'https://www.freestyle.abbott/' },
  { name: 'Sleep Monitor', brand: 'Withings', use: 'Track sleep deprivation contributing to hallucinations', link: 'https://www.withings.com/' },
  { name: 'Medical ID Device', brand: 'MedicAlert', use: 'Emergency information for first responders', link: 'https://www.medicalert.org/' }
],
'Blood Pressure Changes': [
  { name: 'Continuous BP Monitor', brand: 'Omron', use: 'Track 24-hour BP patterns', link: 'https://www.omronhealthcare.com/' },
  { name: 'Smart BP Cuff', brand: 'Withings', use: 'Send readings to healthcare providers', link: 'https://www.withings.com/' },
  { name: 'Position-Aware BP Monitor', brand: 'QardioArm', use: 'Track BP changes with position', link: 'https://www.getqardio.com/' },
  { name: 'Sodium Intake Tracker', brand: 'HORIBA', use: 'Monitor sodium intake affecting BP', link: 'https://www.horiba.com/' }
],
'Abnormal Heart Rhythm': [
  { name: 'Mobile ECG', brand: 'KardiaMobile', use: 'Record heart rhythm during symptoms', link: 'https://www.alivecor.com/' },
  { name: 'Heart Monitor Patch', brand: 'Zio', use: 'Continuous monitoring for up to 14 days', link: 'https://www.irhythmtech.com/' },
  { name: 'Heart Rate Alert Watch', brand: 'Apple', use: 'Detect irregular rhythms and alert user', link: 'https://www.apple.com/watch/' },
  { name: 'Cardiac Event Recorder', brand: 'LifeWatch', use: 'Record heart events on demand', link: 'https://www.lifewatch.com/' }
],
'Varicose Veins': [
  { name: 'Compression Stocking Fitter', brand: 'Juzo', use: 'Proper sizing of compression garments', link: 'https://www.juzousa.com/' },
  { name: 'Vein Visualization System', brand: 'VeinLite', use: 'Examine vein patterns and changes', link: 'https://www.veinlite.com/' },
  { name: 'Leg Elevation System', brand: 'Lounge Doctor', use: 'Optimal positioning for circulation', link: 'https://loungedoctor.com/' },
  { name: 'Circulation Booster', brand: 'Revitive', use: 'Stimulate blood flow in legs', link: 'https://www.revitive.com/' }
],
'Leg Swelling': [
  { name: 'Digital Leg Circumference Measurer', brand: 'Gulick', use: 'Track changes in swelling', link: 'https://www.amazon.in/s?k=gulick+tape+measure' },
  { name: 'Compression Therapy System', brand: 'Normatec', use: 'Reduce fluid buildup through compression', link: 'https://www.hyperice.com/normatec' },
  { name: 'Leg Elevation Pillow', brand: 'Lounge Doctor', use: 'Proper positioning to reduce swelling', link: 'https://loungedoctor.com/' },
  { name: 'Bioimpedance Analyzer', brand: 'InBody', use: 'Measure fluid retention in legs', link: 'https://inbodyusa.com/' }
],
'Intolerance to Cold': [
  { name: 'Infrared Thermometer', brand: 'Fluke', use: 'Track skin temperature response to cold', link: 'https://www.fluke.com/' },
  { name: 'Thyroid Testing Kit', brand: 'EverlyWell', use: 'Check thyroid function affecting cold tolerance', link: 'https://www.everlywell.com/' },
  { name: 'Microcirculation Imaging', brand: 'PeriCam', use: 'Visualize small vessel blood flow', link: 'https://www.perimed-instruments.com/' },
  { name: 'Heated Clothing System', brand: 'Venture Heat', use: 'Targeted warming for sensitive areas', link: 'https://ventureheat.com/' }
],
'Intolerance to Heat': [
  { name: 'Core Body Temperature Monitor', brand: 'CORE', use: 'Track internal temperature responses', link: 'https://corebodytemp.com/' },
  { name: 'Sweat Analysis System', brand: 'Gatorade', use: 'Measure electrolyte loss in sweat', link: 'https://www.gssiweb.org/' },
  { name: 'Personal Cooling System', brand: 'Embr Wave', use: 'Provide cooling sensation on demand', link: 'https://embrlabs.com/' },
  { name: 'Hormone Testing Kit', brand: 'EverlyWell', use: 'Check hormone imbalances affecting temperature regulation', link: 'https://www.everlywell.com/' }
],
'Unintended Weight Change': [
  { name: 'Smart Scale with Body Composition', brand: 'Withings', use: 'Track detailed weight and composition changes', link: 'https://www.withings.com/' },
  { name: 'Metabolic Testing System', brand: 'Breezing', use: 'Measure metabolic rate changes', link: 'https://breezing.com/' },
  { name: 'Thyroid Testing Kit', brand: 'EverlyWell', use: 'Check thyroid function affecting weight', link: 'https://www.everlywell.com/' },
  { name: 'Food Intake Camera', brand: 'Foodvisor', use: 'Document actual food consumption patterns', link: 'https://www.foodvisor.io/' }
],
'Excessive Hunger': [
  { name: 'Continuous Glucose Monitor', brand: 'Dexcom', use: 'Track blood sugar patterns affecting hunger', link: 'https://www.dexcom.com/' },
  { name: 'Ghrelin Testing Kit', brand: 'RayBiotech', use: 'Check hunger hormone levels', link: 'https://www.raybiotech.com/' },
  { name: 'Smart Portion Control Plate', brand: 'Etekcity', use: 'Measure food intake precisely', link: 'https://www.etekcity.com/' },
  { name: 'Satiety Tracking System', brand: 'Lumen', use: 'Monitor metabolism and fuel usage', link: 'https://www.lumen.me/' }
],
'Acid Reflux': [
  { name: 'Esophageal pH Monitoring System', brand: 'Bravo', use: 'Track acid exposure in esophagus', link: 'https://www.medtronic.com/' },
  { name: 'Smart Bed Wedge', brand: 'Helix', use: 'Automatically adjust incline based on symptoms', link: 'https://helixsleep.com/' },
  { name: 'Swallowing & Reflux Monitor', brand: 'Restech', use: 'Detect reflux episodes in throat', link: 'https://www.restech.com/' },
  { name: 'Food pH Tester', brand: 'Apera', use: 'Test acidity of foods and beverages', link: 'https://aperainst.com/' }
],
'Stomach Cramps': [
  { name: 'Abdominal TENS Unit', brand: 'TENSPros', use: 'Electrical stimulation for pain relief', link: 'https://www.amazon.in/s?k=tens+unit+abdominal' },
  { name: 'Food Sensitivity Test', brand: 'EverlyWell', use: 'Identify foods triggering cramps', link: 'https://www.everlywell.com/' },
  { name: 'Smart Heating Pad', brand: 'Sunbeam', use: 'Controlled heat therapy for cramps', link: 'https://www.sunbeam.com/' },
  { name: 'Gut Microbiome Test', brand: 'Viome', use: 'Analyze digestive bacteria affecting cramps', link: 'https://www.viome.com/' }
],
'Rectal Bleeding': [
  { name: 'Fecal Occult Blood Test', brand: 'Hemoccult', use: 'Detect and quantify blood in stool', link: 'https://www.hemoccult.com/' },
  { name: 'Hemorrhoid Monitoring System', brand: 'Anoscope', use: 'Self-examination of rectal area', link: 'https://www.amazon.in/s?k=anoscope' },
  { name: 'Stool Collection System', brand: 'Exact Sciences', use: 'Proper sample collection for testing', link: 'https://www.exactsciences.com/' },
  { name: 'Medical Alert Bracelet', brand: 'MedicAlert', use: 'Emergency information for healthcare providers', link: 'https://www.medicalert.org/' }
],
'Black Stool': [
  { name: 'Stool Color Assessment Kit', brand: 'ColorScan', use: 'Compare and document stool color changes', link: 'https://www.amazon.in/s?k=stool+color+chart' },
  { name: 'Iron Level Testing Kit', brand: 'EverlyWell', use: 'Check for iron supplements causing black stool', link: 'https://www.everlywell.com/' },
  { name: 'Fecal Occult Blood Test', brand: 'Hemoccult', use: 'Test for blood in dark stool', link: 'https://www.hemoccult.com/' },
  { name: 'Medication Tracking System', brand: 'PillDrill', use: 'Monitor medications that affect stool color', link: 'https://www.pilldrill.com/' }
],
'Pale Stool': [
  { name: 'Stool Analysis Kit', brand: 'Doctor\'s Data', use: 'Comprehensive stool assessment', link: 'https://www.doctorsdata.com/' },
  { name: 'Liver Function Test', brand: 'EverlyWell', use: 'Check liver function affecting bile production', link: 'https://www.everlywell.com/' },
  { name: 'Stool Fat Analyzer', brand: 'FecalFat', use: 'Measure fat content in stool', link: 'https://www.amazon.in/s?k=fecal+fat+test' },
  { name: 'Pancreatic Enzyme Tracker', brand: 'PillDrill', use: 'Monitor enzyme replacement therapy', link: 'https://www.pilldrill.com/' }
],
'Greasy Stool': [
  { name: 'Fecal Elastase Test', brand: 'ScheBo', use: 'Check pancreatic enzyme function', link: 'https://www.schebo.com/' },
  { name: 'Fat Malabsorption Kit', brand: 'Doctor\'s Data', use: 'Assess fat digestion capacity', link: 'https://www.doctorsdata.com/' },
  { name: 'Gut Microbiome Test', brand: 'Viome', use: 'Check bacterial balance affecting digestion', link: 'https://www.viome.com/' },
  { name: 'Food Tracking System', brand: 'Cronometer', use: 'Monitor fat intake correlation with symptoms', link: 'https://cronometer.com/' }
],
'Bloody Mucus in Stool': [
  { name: 'Stool Analysis System', brand: 'GI-MAP', use: 'Comprehensive stool testing', link: 'https://www.diagnosticsolutionslab.com/' },
  { name: 'Fecal Calprotectin Test', brand: 'BÜHLMANN', use: 'Check for intestinal inflammation', link: 'https://www.buhlmannlabs.com/' },
  { name: 'Specimen Collection Kit', brand: 'Exact Sciences', use: 'Proper sample collection and preservation', link: 'https://www.exactsciences.com/' },
  { name: 'Medical Alert Bracelet', brand: 'MedicAlert', use: 'Emergency information for healthcare providers', link: 'https://www.medicalert.org/' }
],
'Urinary Urgency': [
  { name: 'Bladder Training Timer', brand: 'PeePal', use: 'Gradually increase time between voids', link: 'https://www.amazon.in/s?k=bladder+training+timer' },
  { name: 'Pelvic Floor Trainer', brand: 'Elvie', use: 'Strengthen muscles controlling urination', link: 'https://www.elvie.com/' },
  { name: 'Urodynamic Home Monitor', brand: 'MedSense', use: 'Track bladder filling and pressure', link: 'https://www.amazon.in/s?k=bladder+scanner+portable' },
  { name: 'UTI Test Kit', brand: 'Scanwell', use: 'Check for infections causing urgency', link: 'https://www.scanwellhealth.com/' }
],
'Urinary Frequency': [
  { name: 'Void Volume Measuring Device', brand: 'Uroscan', use: 'Measure urine output each time', link: 'https://www.amazon.in/s?k=urinal+measuring+cup' },
  { name: 'Bladder Diary Smart Device', brand: 'DryDay', use: 'Track frequency, volume and triggers', link: 'https://www.amazon.in/s?k=bladder+diary+app' },
  { name: 'Pelvic Floor Biofeedback', brand: 'PeriCoach', use: 'Train bladder control muscles', link: 'https://www.pericoach.com/' },
  { name: 'Blood Glucose Monitor', brand: 'OneTouch', use: 'Check for diabetes causing frequency', link: 'https://www.onetouch.com/' }
],
'Urinary Hesitancy': [
  { name: 'Uroflow Meter', brand: 'LABORIE', use: 'Measure urine flow rate', link: 'https://www.laborie.com/' },
  { name: 'Bladder Scanner', brand: 'Verathon', use: 'Check residual urine after voiding', link: 'https://www.verathon.com/' },
  { name: 'Pelvic Muscle Relaxation Device', brand: 'InControl', use: 'Train relaxation of pelvic floor', link: 'https://www.amazon.in/s?k=pelvic+floor+relaxation' },
  { name: 'Prostate Health Monitor', brand: 'ExactoCare', use: 'Track prostate health for men', link: 'https://www.amazon.in/s?k=prostate+health+monitor' }
],
'Decreased Urine Output': [
  { name: 'Fluid Balance Tracker', brand: 'Hidrate', use: 'Monitor intake versus output', link: 'https://hidratespark.com/' },
  { name: 'Urine Color Analyzer', brand: 'UriColor', use: 'Check hydration status through color', link: 'https://www.amazon.in/s?k=urine+color+chart' },
  { name: 'Smart Scale with Body Water', brand: 'Withings', use: 'Track body water percentage changes', link: 'https://www.withings.com/' },
  { name: 'Blood Pressure Monitor', brand: 'Omron', use: 'Check for low BP affecting kidney function', link: 'https://www.omronhealthcare.com/' }
],
'Dark Urine': [
  { name: 'Urine Color Analyzer', brand: 'UriColor', use: 'Document and compare urine color changes', link: 'https://www.amazon.in/s?k=urine+color+chart' },
  { name: 'Hydration Monitor', brand: 'Hidrate', use: 'Track fluid intake affecting urine color', link: 'https://hidratespark.com/' },
  { name: 'Urinalysis Test Kit', brand: 'Mission', use: 'Check for bilirubin and other compounds', link: 'https://www.acon-labs.com/' },
],
'Excessive Sweating': [
  { name: 'Iontophoresis Machine', brand: 'Hidrex', use: 'Treat hyperhidrosis with electrical current', link: 'https://www.hidrexusa.com/' },
  { name: 'Clinical Strength Antiperspirant Applicator', brand: 'Certain Dri', use: 'Precise application of antiperspirant', link: 'https://certaindri.com/' },
  { name: 'Sweat Activity Monitor', brand: 'Embr Wave', use: 'Track and manage body temperature', link: 'https://embrlabs.com/' },
  { name: 'Micro-Current Sweat Control', brand: 'RA Fischer', use: 'Professional-grade sweat reduction', link: 'https://www.rafischer.com/' }
],
'Cold Hands or Feet': [
  { name: 'Circulation Booster', brand: 'Revitive', use: 'Improve blood flow to extremities', link: 'https://www.revitive.com/' },
  { name: 'Heated Gloves', brand: 'Volt', use: 'Battery-powered warmth for hands', link: 'https://voltheat.com/' },
  { name: 'Infrared Therapy Boots', brand: 'UTK', use: 'Penetrating heat to improve circulation', link: 'https://utktechnology.com/' },
  { name: 'Thermal Imaging Camera', brand: 'FLIR', use: 'Identify areas of poor circulation', link: 'https://www.flir.com/' }
],
'Brittle Nails': [
  { name: 'Nail Moisture Meter', brand: 'Sigma', use: 'Measure hydration levels in nails', link: 'https://www.amazon.in/s?k=moisture+meter+nails' },
  { name: 'Keratin Treatment System', brand: 'Nail-Tek', use: 'Apply strengthening proteins', link: 'https://www.amazon.in/Nail-Tek/s?k=Nail+Tek' },
  { name: 'UV Nail Lamp', brand: 'Sunuv', use: 'Cure nail strengthening treatments', link: 'https://www.amazon.in/s?k=UV+nail+lamp' },
  { name: 'Nail Imaging Camera', brand: 'DigiNail', use: 'Monitor nail health and growth', link: 'https://www.amazon.in/s?k=digital+microscope+nail' }
],
'Muscle Cramping': [
  { name: 'Magnesium Testing Kit', brand: 'EverlyWell', use: 'Check magnesium levels', link: 'https://www.everlywell.com/' },
  { name: 'Electrolyte Monitor', brand: 'Lumen', use: 'Track hydration and electrolyte balance', link: 'https://www.lumen.me/' },
  { name: 'Percussion Massage Gun', brand: 'Theragun', use: 'Release muscle tension and cramping', link: 'https://www.therabody.com/' },
  { name: 'Compression Recovery System', brand: 'Normatec', use: 'Improve circulation to cramping muscles', link: 'https://www.hyperice.com/normatec' }
],
'Ankle Pain': [
  { name: 'Ankle Brace', brand: 'McDavid', use: 'Support and stabilize ankle joint', link: 'https://www.mcdavidusa.com/' },
  { name: 'TENS Unit', brand: 'iReliev', use: 'Electrical stimulation for pain relief', link: 'https://ireliev.com/' },
  { name: 'Compression Ice Wrap', brand: 'Aircast', use: 'Combined cold therapy and compression', link: 'https://www.djoglobal.com/our-brands/aircast' },
  { name: 'Gait Analysis System', brand: 'Tekscan', use: 'Analyze walking pattern affecting ankle', link: 'https://www.tekscan.com/' }
],
'Wrist Pain': [
  { name: 'Wrist Splint', brand: 'Mueller', use: 'Immobilize and support wrist', link: 'https://www.muellersportsmed.com/' },
  { name: 'Carpal Tunnel Testing Device', brand: 'Maze Medical', use: 'Self-assessment for carpal tunnel', link: 'https://www.amazon.in/s?k=carpal+tunnel+testing+device' },
  { name: 'Ergonomic Mouse', brand: 'Logitech', use: 'Reduce wrist strain during computer use', link: 'https://www.logitech.com/' },
  { name: 'Wrist Strengthening System', brand: 'Powerball', use: 'Build supporting muscles', link: 'https://powerballs.com/' }
],
'Hip Pain': [
  { name: 'Hip Brace', brand: 'BraceAbility', use: 'Support and stabilize hip joint', link: 'https://www.braceability.com/' },
  { name: 'Pressure Mapping System', brand: 'XSensor', use: 'Identify pressure points while sitting', link: 'https://www.xsensor.com/' },
  { name: 'Ultrasound Therapy Device', brand: 'EZUltrasound', use: 'Deep tissue therapy for hip pain', link: 'https://ezultrasound.com/' },
  { name: 'Hip Muscle Stimulator', brand: 'Compex', use: 'Strengthen supporting muscles', link: 'https://www.compexstore.com/' }
],
'Stiffness': [
  { name: 'Flexibility Measurement Device', brand: 'Acuflex', use: 'Quantify changes in range of motion', link: 'https://www.amazon.in/s?k=goniometer' },
  { name: 'Infrared Heat Therapy Mat', brand: 'UTK', use: 'Reduce stiffness with penetrating heat', link: 'https://utktechnology.com/' },
  { name: 'Vibration Therapy Platform', brand: 'Power Plate', use: 'Improve flexibility through vibration', link: 'https://powerplate.com/' },
  { name: 'Smart Foam Roller', brand: 'Hyperice', use: 'Guided myofascial release', link: 'https://www.hyperice.com/' }
],
'Swollen Joints': [
  { name: 'Joint Circumference Measurement Tool', brand: 'Gulick', use: 'Track changes in joint swelling', link: 'https://www.amazon.in/s?k=gulick+tape+measure' },
  { name: 'Cold Therapy System', brand: 'Aircast', use: 'Targeted cold therapy to reduce swelling', link: 'https://www.djoglobal.com/our-brands/aircast' },
  { name: 'Compression Therapy System', brand: 'Normatec', use: 'Reduce fluid buildup in joints', link: 'https://www.hyperice.com/normatec' },
  { name: 'Therapeutic Ultrasound Device', brand: 'EZUltrasound', use: 'Deep tissue therapy for joint inflammation', link: 'https://ezultrasound.com/' }
],
'Foot Pain': [
  { name: 'Custom Orthotic Scanner', brand: 'Dr. Scholls', use: 'Analyze foot pressure points', link: 'https://www.drscholls.com/' },
  { name: 'TENS Foot Therapy', brand: 'AccuRelief', use: 'Electrical stimulation for foot pain', link: 'https://www.amazon.in/s?k=tens+foot+therapy' },
  { name: 'Diabetic Foot Scanner', brand: 'Podimetrics', use: 'Monitor foot temperature changes', link: 'https://www.podimetrics.com/' },
  { name: 'Night Splint', brand: 'Aircast', use: 'Stretch plantar fascia during sleep', link: 'https://www.djoglobal.com/our-brands/aircast' }
],
'Difficulty Walking': [
  { name: 'Gait Analysis System', brand: 'Tekscan', use: 'Detailed analysis of walking pattern', link: 'https://www.tekscan.com/' },
  { name: 'Smart Cane', brand: 'iWalk', use: 'Balance assistance with fall detection', link: 'https://iwalk-free.com/' },
  { name: 'Functional Electrical Stimulation Device', brand: 'Bioness', use: 'Stimulate muscles needed for walking', link: 'https://www.bioness.com/' },
  { name: 'Rehabilitation Exoskeleton', brand: 'Ekso', use: 'Powered assistance for walking', link: 'https://eksobionics.com/' }
],
'Eye Discharge': [
  { name: 'Digital Eye Microscope', brand: 'Depstech', use: 'Examine eye discharge composition', link: 'https://www.depstech.com/' },
  { name: 'Eyelid Cleanser', brand: 'Ocusoft', use: 'Precise application of lid cleansers', link: 'https://www.ocusoft.com/' },
  { name: 'Tear Film Analyzer', brand: 'TearLab', use: 'Analyze tear composition', link: 'https://www.tearlab.com/' },
  { name: 'Warm Compress System', brand: 'Bruder', use: 'Therapeutic warmth for meibomian glands', link: 'https://www.bruder.com/' }
],
'Eye Redness': [
  { name: 'Digital Eye Camera', brand: 'Eyeque', use: 'Document and track eye redness', link: 'https://www.eyeque.com/' },
  { name: 'Allergy Testing Kit', brand: 'EverlyWell', use: 'Check for allergies causing redness', link: 'https://www.everlywell.com/' },
  { name: 'Eye Mist Dispenser', brand: 'Refresh', use: 'Fine mist hydration for dry eyes', link: 'https://www.refreshbrand.com/' },
  { name: 'Scleral Redness Analyzer', brand: 'EyeDoc', use: 'Quantify changes in eye redness', link: 'https://www.amazon.in/s?k=digital+eye+camera' }
],
'Swollen Eyelids': [
  { name: 'Cooling Eye Mask', brand: 'Bruder', use: 'Reduce eyelid inflammation', link: 'https://www.bruder.com/' },
  { name: 'Eyelid Cleanser System', brand: 'Ocusoft', use: 'Remove allergens and irritants', link: 'https://www.ocusoft.com/' },
  { name: 'Allergy Testing Kit', brand: 'EverlyWell', use: 'Identify triggers for reactions', link: 'https://www.everlywell.com/' },
  { name: 'Eyelid Imaging Device', brand: 'Depstech', use: 'Track changes in eyelid swelling', link: 'https://www.depstech.com/' }
],
'Ear Discharge': [
  { name: 'Otoscope', brand: 'Dr. Mom', use: 'Visualize ear canal and discharge', link: 'https://www.amazon.in/s?k=dr+mom+otoscope' },
  { name: 'Ear Irrigation System', brand: 'Elephant Ear', use: 'Safely clean ear canal', link: 'https://www.elephantearwasher.com/' },
  { name: 'Ear Discharge Analysis Kit', brand: 'EarCheck', use: 'Test for infection in discharge', link: 'https://www.amazon.in/s?k=ear+infection+test+kit' },
  { name: 'Ear Canal Camera', brand: 'Depstech', use: 'Document condition and recovery', link: 'https://www.depstech.com/' }
],
'Ear Fullness': [
  { name: 'Eustachian Tube Exerciser', brand: 'Otovent', use: 'Equalize ear pressure', link: 'https://www.otovent.co.uk/' },
  { name: 'Tympanometer App', brand: 'EarHealth', use: 'Check for middle ear fluid', link: 'https://www.amazon.in/s?k=ear+pressure+device' },
  { name: 'Personal Sound Amplifier', brand: 'Etymotic', use: 'Compensate for hearing affected by fullness', link: 'https://www.etymotic.com/' },
  { name: 'Ear Pressure Relief Device', brand: 'EarPopper', use: 'Relieve negative ear pressure', link: 'https://www.earpopper.com/' }
],
'Itchy Ears': [
  { name: 'Ear pH Meter', brand: 'pHear', use: 'Check for pH imbalance in ear canal', link: 'https://www.amazon.in/s?k=ph+meter' },
  { name: 'Targeted Light Therapy', brand: 'TheraPro', use: 'Anti-inflammatory light treatment', link: 'https://www.amazon.in/s?k=ear+light+therapy' },
  { name: 'Ear Camera', brand: 'Depstech', use: 'Examine ear canal for causes', link: 'https://www.depstech.com/' },
  { name: 'Ear Climate Control', brand: 'Macks', use: 'Maintain optimal ear canal humidity', link: 'https://www.macksearplugs.com/' }
],
'Facial Pain': [
  { name: 'TENS Facial Unit', brand: 'Ageless Wonder', use: 'Electrical stimulation therapy for facial nerves', link: 'https://www.amazon.in/s?k=facial+tens+unit' },
  { name: 'Thermal Imaging Camera', brand: 'FLIR', use: 'Identify inflammation patterns', link: 'https://www.flir.com/' },
  { name: 'Jaw Alignment Device', brand: 'TMJ NextGeneration', use: 'Correct jaw positioning', link: 'https://tmjnextgen.com/' },
  { name: 'Sinus Pressure Monitor', brand: 'SinuPulse', use: 'Track changes in sinus pressure', link: 'https://www.sinupulse.com/' }
],
'Jaw Pain': [
  { name: 'TMJ Monitor', brand: 'BruxRelief', use: 'Track jaw clenching and grinding', link: 'https://bruxrelief.com/' },
  { name: 'Jaw Exerciser', brand: 'JawFlex', use: 'Strengthen and stretch jaw muscles', link: 'https://www.amazon.in/s?k=jaw+exerciser' },
  { name: 'Bite Force Gauge', brand: 'OcclusionMeter', use: 'Measure bite pressure patterns', link: 'https://www.amazon.in/s?k=bite+force+gauge' },
  { name: 'Thermal Therapy Mask', brand: 'Bruder', use: 'Heat therapy for TMJ muscles', link: 'https://www.bruder.com/' }
],
'Bleeding Gums': [
  { name: 'Gum Health Monitor', brand: 'Philips Sonicare', use: 'Track gum health improvements', link: 'https://www.philips.co.in/c-m-pe/electric-toothbrushes' },
  { name: 'Oral Irrigation System', brand: 'Waterpik', use: 'Targeted cleaning between teeth', link: 'https://www.waterpik.com/' },
  { name: 'Oral Blood Oxygen Monitor', brand: 'DentalO2', use: 'Check gum tissue oxygenation', link: 'https://www.amazon.in/s?k=pulse+oximeter' },
  { name: 'Oral pH Testing Kit', brand: 'pHor', use: 'Check mouth pH affecting gum health', link: 'https://www.amazon.in/s?k=ph+test+strips+saliva' }
],
'Toothache': [
  { name: 'Dental Thermography Device', brand: 'ThermalMouth', use: 'Detect temperature changes of inflamed tooth', link: 'https://www.amazon.in/s?k=infrared+thermometer' },
  { name: 'Intraoral Camera', brand: 'Depstech', use: 'Visualize affected tooth', link: 'https://www.depstech.com/' },
  { name: 'Tooth Nerve Stimulator', brand: 'PulpTest', use: 'Test tooth nerve response', link: 'https://www.amazon.in/s?k=dental+pulp+tester' },
  { name: 'Dental Pressure Gauge', brand: 'BiteSense', use: 'Identify pressure sensitivities', link: 'https://www.amazon.in/s?k=bite+force+gauge' }
],
'Frequent Coughing': [
  { name: 'Cough Frequency Monitor', brand: 'Hyfe', use: 'Track cough patterns and triggers', link: 'https://www.hyfeapp.com/' },
  { name: 'Ultrasonic Humidifier', brand: 'Levoit', use: 'Maintain optimal air moisture', link: 'https://www.levoit.com/' },
  { name: 'Air Quality Monitor', brand: 'Awair', use: 'Detect irritants triggering cough', link: 'https://getawair.com/' },
  { name: 'Digital Stethoscope', brand: 'Eko', use: 'Record and analyze lung sounds', link: 'https://www.ekohealth.com/' }
],
'Coughing Blood': [
  { name: 'Pulse Oximeter', brand: 'Nonin', use: 'Monitor blood oxygen levels', link: 'https://www.nonin.com/' },
  { name: 'Specimen Collection Kit', brand: 'Path-Tec', use: 'Safely collect samples for testing', link: 'https://www.amazon.in/s?k=specimen+collection+kit' },
  { name: 'Digital Stethoscope', brand: 'Eko', use: 'Record lung sounds for medical review', link: 'https://www.ekohealth.com/' },
  { name: 'Medical Alert Bracelet', brand: 'MedicAlert', use: 'Emergency information for first responders', link: 'https://www.medicalert.org/' }
],
'Nasal Congestion': [
  { name: 'Nasal Irrigation System', brand: 'NeilMed', use: 'Flush nasal passages to clear congestion', link: 'https://www.neilmed.com/' },
  { name: 'Nasal Dilator Strips', brand: 'Breathe Right', use: 'Open nasal passages during sleep', link: 'https://www.breatheright.com/' },
  { name: 'Portable Steam Inhaler', brand: 'Mabis', use: 'Provide warm moisture to clear congestion', link: 'https://mabisdmi.com/' },
  { name: 'Air Purifier', brand: 'Honeywell', use: 'Remove allergens that cause congestion', link: 'https://www.honeywellhome.com/us/en/products/air/air-purifiers/' }
],
'Post-Nasal Drip': [
  { name: 'Nasal Irrigation System', brand: 'NeilMed', use: 'Flush mucus from sinuses', link: 'https://www.neilmed.com/' },
  { name: 'Mucus Viscosity Analyzer', brand: 'MucusCheck', use: 'Assess mucus thickness', link: 'https://www.amazon.in/s?k=viscosity+meter' },
  { name: 'Elevated Sleeping System', brand: 'Medslant', use: 'Prevent drainage while sleeping', link: 'https://www.medslant.com/' },
  { name: 'Ultrasonic Humidifier', brand: 'Levoit', use: 'Thin mucus with proper humidity', link: 'https://www.levoit.com/' }
],
'Increased Heart Rate': [
  { name: 'ECG Monitor', brand: 'KardiaMobile', use: 'Record heart rhythm during episodes', link: 'https://www.alivecor.com/' },
  { name: 'Heart Rate Variability Monitor', brand: 'Polar', use: 'Track heart rate patterns and stress', link: 'https://www.polar.com/' },
  { name: 'Blood Pressure Monitor', brand: 'Omron', use: 'Check BP changes with heart rate', link: 'https://www.omronhealthcare.com/' },
  { name: 'Smart Watch with ECG', brand: 'Apple', use: 'Continuous monitoring with alerts', link: 'https://www.apple.com/watch/' }
],
'Sexual Dysfunction': [
  { name: 'Hormone Testing Kit', brand: 'EverlyWell', use: 'Check hormone levels affecting function', link: 'https://www.everlywell.com/' },
  { name: 'Pelvic Floor Trainer', brand: 'Elvie', use: 'Strengthen supporting muscles', link: 'https://www.elvie.com/' },
  { name: 'Blood Flow Monitor', brand: 'SonicVue', use: 'Check circulation to genital area', link: 'https://www.amazon.in/s?k=doppler+ultrasound' },
  { name: 'Stress Response Monitor', brand: 'Muse', use: 'Track stress affecting performance', link: 'https://choosemuse.com/' }
],
'Irregular Periods': [
  { name: 'Ovulation Tracker', brand: 'Clearblue', use: 'Monitor fertility cycles', link: 'https://www.clearblue.com/' },
  { name: 'Basal Body Thermometer', brand: 'iProven', use: 'Track subtle temperature changes', link: 'https://iproven.com/' },
  { name: 'Period Tracking Device', brand: 'Tempdrop', use: 'Monitor menstrual cycle patterns', link: 'https://www.tempdrop.com/' },
  { name: 'Hormone Test Kit', brand: 'EverlyWell', use: 'At-home hormone level testing', link: 'https://www.everlywell.com/products/womens-health-test/' }
],
'Breast Pain': [
  { name: 'Breast Thermography Device', brand: 'Med-Hot', use: 'Monitor temperature changes in breast tissue', link: 'https://www.amazon.in/s?k=thermography+camera' },
  { name: 'Lymphatic Drainage System', brand: 'LymphaPro', use: 'Aid fluid movement in breast tissue', link: 'https://www.amazon.in/s?k=lymphatic+drainage+massage+device' },
  { name: 'Specialized Support Bra', brand: 'Wacoal', use: 'Proper support to reduce discomfort', link: 'https://www.wacoal.com/' },
  { name: 'Ultrasound Imaging Device', brand: 'Butterfly iQ', use: 'At-home imaging for monitoring (requires professional interpretation)', link: 'https://www.butterflynetwork.com/' }
],
'Menstrual Cramps': [
  { name: 'TENS Unit for Cramps', brand: 'Livia', use: 'Electrical stimulation for pain relief', link: 'https://mylivia.com/' },
  { name: 'Smart Heating Pad', brand: 'Sunbeam', use: 'Controlled temperature therapy', link: 'https://www.sunbeam.com/' },
  { name: 'Hormone Test Kit', brand: 'EverlyWell', use: 'Check hormone levels affecting cramps', link: 'https://www.everlywell.com/' },
  { name: 'Acupressure Mat', brand: 'Shakti', use: 'Stimulate pain-relieving pressure points', link: 'https://www.amazon.in/s?k=acupressure+mat' }
],
'Vaginal Discharge': [
  { name: 'pH Testing Kit', brand: 'VH Essentials', use: 'Check vaginal pH levels', link: 'https://vhessentials.com/' },
  { name: 'At-Home Infection Test', brand: 'Monistat', use: 'Screen for common infections', link: 'https://www.monistat.com/' },
  { name: 'Vaginal Microbiome Test', brand: 'Evvy', use: 'Comprehensive vaginal flora analysis', link: 'https://www.evvy.com/' },
  { name: 'Specimen Collection System', brand: 'BD', use: 'Proper sample collection for testing', link: 'https://www.bd.com/' }
], 
'Vaginal Izching': [
  { name: 'pH Balance Monitor', brand: 'VH Essentials', use: 'Track vaginal pH changes', link: 'https://vhessentials.com/' },
  { name: 'Yeast Infection Test', brand: 'Monistat', use: 'Check for fungal infection', link: 'https://www.monistat.com/' },
  { name: 'Cooling Therapy Device', brand: 'Vagicool', use: 'Soothe irritation without medication', link: 'https://www.amazon.in/s?k=cooling+therapy+device' },
  { name: 'Intimate Area Moisture Meter', brand: 'DermaCheck', use: 'Monitor skin hydration', link: 'https://www.amazon.in/s?k=skin+moisture+meter' }
],
'Testicular Pain': [
  { name: 'Scrotal Ultrasound Device', brand: 'SonoScape', use: 'Home imaging for monitoring (requires professional interpretation)', link: 'https://www.sonoscape.com/' },
  { name: 'Scrotal Support', brand: 'McDavid', use: 'Proper support to reduce pain', link: 'https://www.mcdavidusa.com/' },
  { name: 'Cooling Therapy System', brand: 'Polar Care', use: 'Safe cooling for inflammation reduction', link: 'https://www.breg.com/' },
  { name: 'Hormone Testing Kit', brand: 'EverlyWell', use: 'Check hormone levels affecting pain', link: 'https://www.everlywell.com/' }
],
'Blood in Stool': [
  { name: 'Fecal Occult Blood Test', brand: 'EZ Detect', use: 'Home screening for blood in stool', link: 'https://www.ezdetect.com/' },
  { name: 'Specimen Collection System', brand: 'Exact Sciences', use: 'Properly collect samples for testing', link: 'https://www.exactsciences.com/' },
  { name: 'Digital Stool Scanner', brand: 'SmartScan', use: 'AI-based visual assessment of stool', link: 'https://www.amazon.in/s?k=stool+scanner' },
  { name: 'Medical Alert Bracelet', brand: 'MedicAlert', use: 'Emergency information for health providers', link: 'https://www.medicalert.org/' }
],
'Heartburn': [
  { name: 'Esophageal pH Monitor', brand: 'Bravo', use: 'Track acid exposure in esophagus', link: 'https://www.medtronic.com/covidien/en-us/products/reflux-testing/bravo-reflux-testing-system.html' },
  { name: 'Smart Antacid Dispenser', brand: 'PillDrill', use: 'Track medication use and timing', link: 'https://www.pilldrill.com/' },
  { name: 'Adjustable Bed Wedge', brand: 'MedSlant', use: 'Proper positioning to prevent reflux', link: 'https://www.medslant.com/' },
  { name: 'Food pH Tester', brand: 'Apera', use: 'Check acidity of foods', link: 'https://aperainst.com/' }
],
'Bloating': [
  { name: 'Abdominal Circumference Tracker', brand: 'Gulick', use: 'Measure changes in bloating', link: 'https://www.amazon.in/s?k=gulick+tape+measure' },
  { name: 'Hydrogen Breath Tester', brand: 'Gastro+', use: 'Check for SIBO and food intolerances', link: 'https://www.breathid.com/' },
  { name: 'Digestive Enzyme Dispenser', brand: 'PillDrill', use: 'Time-release enzyme delivery', link: 'https://www.pilldrill.com/' },
  { name: 'Gas & Bloating Monitor', brand: 'FoodMarble', use: 'Track digestive fermentation', link: 'https://foodmarble.com/' }
],
'Flatulence': [
  { name: 'Digestive Gas Monitor', brand: 'FoodMarble', use: 'Track foods causing gas', link: 'https://foodmarble.com/' },
  { name: 'Microbiome Test Kit', brand: 'Viome', use: 'Analyze gut bacteria affecting gas', link: 'https://www.viome.com/' },
  { name: 'Food Intolerance Test', brand: 'EverlyWell', use: 'Identify gas-causing foo  Swollen Ankles'},
  { name: 'Compression Socks', brand: 'Sigvaris', use: 'Improve circulation in lower extremities', link: 'https://www.sigvaris.com/' },
  { name: 'Foot Elevation Pillow', brand: 'Lounge Doctor', use: 'Proper elevation to reduce swelling', link: 'https://loungedoctor.com/' },
  { name: 'Ankle Brace', brand: 'Mueller', use: 'Support swollen ankles during movement', link: 'https://www.muellersportsmed.com/ankle-braces' },
  { name: 'Digital Foot Scanner', brand: 'Dr. Scholls', use: 'Analyze pressure points and swelling', link: 'https://www.drscholls.com/products/foot-mapping/' }
],
'Back Pain': [
  { name: 'Posture Corrector', brand: 'Tynor', use: 'Support spine alignment during activities', link: 'https://tynor.com/products/posture-corrector' },
  { name: 'Lumbar Support Belt', brand: 'Flamingo', use: 'Reduce lower back strain and provide support', link: 'https://www.flamingoindia.com/collections/back-supports' },
  { name: 'TENS Unit', brand: 'Omron', use: 'Electrical stimulation for pain management', link: 'https://www.omronhealthcare.com/tens' },
  { name: 'Acupressure Mat', brand: 'ProsourceFit', use: 'Stimulate pressure points along the spine', link: 'https://prosourcefit.com/products/acupressure-mat-and-pillow-set' }
],
'Neck Pain': [
  { name: 'Cervical Traction Device', brand: 'Posture Pump', use: 'Decompress cervical spine', link: 'https://posturepump.com/' },
  { name: 'Contoured Neck Pillow', brand: 'Tempur-Pedic', use: 'Maintain proper neck alignment during sleep', link: 'https://www.tempurpedic.com/pillows/' },
  { name: 'Smart Posture Sensor', brand: 'Upright GO', use: 'Alert to poor neck posture during day', link: 'https://www.uprightpose.com/' },
  { name: 'Neck Massager', brand: 'Naipo', use: 'Relieve muscle tension with targeted massage', link: 'https://www.naipocare.com/' }
],
'Shoulder Pain': [
  { name: 'Shoulder Support Brace', brand: 'McDavid', use: 'Stabilize and support shoulder joint', link: 'https://www.mcdavidusa.com/collections/shoulder' },
  { name: 'Posture Corrector', brand: 'Tynor', use: 'Adjust shoulder alignment', link: 'https://tynor.com/products/posture-corrector' },
  { name: 'Hot/Cold Therapy Wrap', brand: 'TheraPAQ', use: 'Targeted temperature therapy', link: 'https://therapaq.com/' },
  { name: 'Percussion Massage Gun', brand: 'Theragun', use: 'Deep tissue massage for shoulder muscles', link: 'https://www.therabody.com/us/en-us/theragun.html' }
],
'Knee Pain': [
  { name: 'Knee Brace', brand: 'DonJoy', use: 'Support and stabilize knee joint', link: 'https://www.djoglobal.com/donjoy' },
  { name: 'Cold Therapy System', brand: 'Polar Care', use: 'Continuous cold therapy for inflammation', link: 'https://www.breg.com/products/cold-therapy/devices/polar-care-cube/' },
  { name: 'Compression Sleeve', brand: 'Bauerfeind', use: 'Improve circulation and provide support', link: 'https://www.bauerfeind.com/' },
  { name: 'Knee Rehabilitation Device', brand: 'Kinetec', use: 'Controlled motion exercise for recovery', link: 'https://www.kinetec.fr/en/' }
],
'Dry Mouth': [
  { name: 'Oral Moisture Meter', brand: 'Periotron', use: 'Measure oral moisture levels', link: 'https://www.oraflow.com/' },
  { name: 'Ultrasonic Humidifier', brand: 'Levoit', use: 'Add moisture to room air', link: 'https://www.levoit.com/humidifiers' },
  { name: 'Saliva Substitute Device', brand: 'Aquoral', use: 'Deliver artificial saliva precisely', link: 'https://www.amazon.in/AQUORAL-ARTIFICIAL-SALIVA-SPRAY-15ML/dp/B07NZ4QW7G' },
  { name: 'Hydration Reminder Bottle', brand: 'Hidrate', use: 'Track water intake to maintain hydration', link: 'https://hidratespark.com/' }
],
'Excessive Thirst': [
  { name: 'Glucose Monitor', brand: 'FreeStyle Libre', use: 'Check for diabetes-related causes', link: 'https://www.freestyle.abbott/in-en/home.html' },
  { name: 'Smart Water Bottle', brand: 'Hidrate', use: 'Track hydration levels', link: 'https://hidratespark.com/' },
  { name: 'Electrolyte Testing Strips', brand: 'EverEase', use: 'Check for electrolyte imbalances', link: 'https://www.amazon.in/s?k=electrolyte+testing+strips' },
  { name: 'Water Quality Tester', brand: 'HoneForest', use: 'Check water quality that may affect thirst', link: 'https://www.amazon.in/HoneForest-Quality-Digital-Temperature-0-9999ppm/dp/B073713G5F' }
],
'Frequent Urination': [
  { name: 'Bladder Scanner', brand: 'PortaScan', use: 'Monitor bladder health non-invasively', link: 'https://www.verathon.com/bladderscanner/' },
  { name: 'Pelvic Floor Trainer', brand: 'Elvie', use: 'Strengthen pelvic floor muscles', link: 'https://www.elvie.com/en-us/shop/elvie-trainer' },
  { name: 'Biofeedback Device', brand: 'PeriCoach', use: 'Train bladder control', link: 'https://www.pericoach.com/' },
  { name: 'Glucose Monitor', brand: 'FreeStyle', use: 'Check for diabetes-related causes', link: 'https://www.freestyle.abbott/in-en/home.html' }
],
'Painful Urination': [
  { name: 'UTI Test Strips', brand: 'AZO', use: 'Check for urinary tract infections', link: 'https://www.azoproducts.com/products/uti-products/azo-test-strips/' },
  { name: 'pH Meter', brand: 'HealthyWiser', use: 'Check urine pH that may indicate infection', link: 'https://www.amazon.in/HealthyWiser-Urinalysis-Reagent-Test-Strips/dp/B01G4IUSUQ' },
  { name: 'Pelvic Heat Therapy', brand: 'Thermacare', use: 'Soothe discomfort with targeted heat', link: 'https://www.thermacare.com/' },
  { name: 'Water Intake Tracker', brand: 'Hidrate', use: 'Ensure proper hydration', link: 'https://hidratespark.com/' }
],
'Blood in Urine': [
  { name: 'Urine Test Strips', brand: 'Bayer', use: 'Check for blood, proteins, and infections', link: 'https://www.bayer.com/en/pharma/urinalysis' },
  { name: 'Digital Urinalysis Device', brand: 'Healthy.io', use: 'Smartphone-based urinalysis', link: 'https://healthy.io/' },
  { name: 'At-home UTI Test', brand: 'AZO', use: 'Detect urinary tract infections', link: 'https://www.azoproducts.com/products/uti-products/azo-test-strips/' },
  { name: 'Digital Microscope', brand: 'QBC', use: 'Examine urine sediment', link: 'https://www.qbcdiagnostics.com/' }
],
'Loss of Smell': [
  { name: 'Smell Training Kit', brand: 'AbScent', use: 'Rehabilitate sense of smell', link: 'https://abscent.org/' },
  { name: 'Essential Oil Diffuser', brand: 'InnoGear', use: 'Strong scents for smell therapy', link: 'https://www.innogear.com/' },
  { name: 'Nasal Irrigation System', brand: 'NeilMed', use: 'Clear nasal passages for better airflow', link: 'https://www.neilmed.com/' },
  { name: 'Indoor Air Quality Monitor', brand: 'Awair', use: 'Detect irritants affecting smell', link: 'https://getawair.com/' }
],
'Loss of Taste': [
  { name: 'Taste Training Kit', brand: 'FlavorActiv', use: 'Rehabilitate sense of taste', link: 'https://www.flavoractiv.com/' },
  { name: 'Zinc Status Test', brand: 'EverlyWell', use: 'Check zinc levels that affect taste', link: 'https://www.everlywell.com/' },
  { name: 'Oral pH Meter', brand: 'Horiba', use: 'Monitor mouth pH that impacts taste', link: 'https://www.horiba.com/' },
  { name: 'Saliva Stimulator Device', brand: 'Saliwell', use: 'Increase saliva production for taste', link: 'https://saliwell.com/' }
],
'Mouth Ulcers': [
  { name: 'Oral Camera', brand: 'Depstech', use: 'Monitor ulcer healing progress', link: 'https://www.depstech.com/' },
  { name: 'LED Light Therapy Device', brand: 'Luminance RED', use: 'Accelerate healing with light therapy', link: 'https://luminancered.com/' },
  { name: 'Oral Irrigator', brand: 'Waterpik', use: 'Gentle cleaning around ulcers', link: 'https://www.waterpik.com/' },
  { name: 'pH Testing Strips', brand: 'pHion', use: 'Check oral pH balance', link: 'https://www.amazon.in/pH-Test-Strips/s?k=pH+Test+Strips' }
],
'Bad Breath': [
  { name: 'Halimeter', brand: 'Interscan', use: 'Measure sulfur compounds causing odor', link: 'https://www.halimeter.com/' },
  { name: 'Oral Irrigation System', brand: 'Waterpik', use: 'Deep clean between teeth', link: 'https://www.waterpik.com/' },
  { name: 'Tongue Cleaner', brand: 'Orabrush', use: 'Remove bacteria from tongue surface', link: 'https://www.orabrush.com/' },
  { name: 'Oral Probiotics Dispenser', brand: 'TheraBreath', use: 'Replace harmful bacteria with beneficial ones', link: 'https://www.therabreath.com/' }
],
'Gum Bleeding': [
  { name: 'Oral Irrigator', brand: 'Waterpik', use: 'Gentle but thorough cleaning', link: 'https://www.waterpik.com/' },
  { name: 'Gum Stimulator', brand: 'GUM', use: 'Improve gum circulation', link: 'https://www.gumbrand.com/' },
  { name: 'Oral Camera', brand: 'Depstech', use: 'Monitor gum health', link: 'https://www.depstech.com/' },
  { name: 'Electric Toothbrush with Pressure Sensor', brand: 'Oral-B', use: 'Prevent excessive brushing force', link: 'https://www.oralb.com/' }
],
'Hair Loss': [
  { name: 'Hair Growth Laser Device', brand: 'HairMax', use: 'Stimulate follicles with low-level laser therapy', link: 'https://hairmax.com/' },
  { name: 'Scalp Camera', brand: 'Depstech', use: 'Monitor hair density and scalp health', link: 'https://www.depstech.com/' },
  { name: 'Hair Thickness Analyzer', brand: 'HairCheck', use: 'Measure hair mass index', link: 'https://haircheck.com/' },
  { name: 'Scalp Massager', brand: 'Heeta', use: 'Improve circulation to hair follicles', link: 'https://www.amazon.in/Heeta-Shampoo-Scalp-Massager-Silicone/dp/B07GX3H3KN' }
],
'Dry Skin': [
  { name: 'Humidifier', brand: 'Levoit', use: 'Maintain optimal air moisture for skin health', link: 'https://www.levoit.com/humidifiers' },
  { name: 'Skin Moisture Meter', brand: 'Myskin', use: 'Monitor skin hydration levels', link: 'https://www.amazon.in/Skin-Moisture-Meter/s?k=Skin+Moisture+Meter' },
  { name: 'Hygrometer', brand: 'ThermoPro', use: 'Monitor room humidity levels', link: 'https://buythermopro.com/product-category/hygrometers/' },
  { name: 'UV Protection Meter', brand: 'Solarmeter', use: 'Measure UV exposure that can dry skin', link: 'https://www.solarmeter.com/' }
],
'Bruising Easily': [
  { name: 'Vitamin K Cream Applicator', brand: 'Reviva', use: 'Targeted application to reduce bruising', link: 'https://www.revivalabs.com/' },
  { name: 'Arnica Gel Dispenser', brand: 'Boiron', use: 'Apply bruise-reducing gel', link: 'https://www.boiron.com/' },
  { name: 'Cold Therapy System', brand: 'Polar Care', use: 'Immediate cold therapy for new bruises', link: 'https://www.breg.com/products/cold-therapy/devices/polar-care-cube/' },
  { name: 'Digital Camera with Measurement', brand: 'Depstech', use: 'Track bruise healing progress', link: 'https://www.depstech.com/' }
],
'Yellowing of Skin': [
  { name: 'Bilirubin Meter', brand: 'BiliChek', use: 'Non-invasive jaundice assessment', link: 'https://www.draeger.com/en-us_us/Products/BiliCheck' },
  { name: 'Color Analysis Camera', brand: 'DermLite', use: 'Document and analyze skin tone changes', link: 'https://dermlite.com/' },
  { name: 'Liver Function Home Test', brand: 'EverlyWell', use: 'Check basic liver function indicators', link: 'https://www.everlywell.com/' },
  { name: 'Medical Alert Device', brand: 'MedicAlert', use: 'Emergency information for liver conditions', link: 'https://www.medicalert.org/' }
],
'Tremors': [
  { name: 'Weighted Utensils', brand: 'Liftware', use: 'Stabilize hand movements during eating', link: 'https://www.liftware.com/' },
  { name: 'Wrist Stabilizer', brand: 'Mueller', use: 'Reduce hand shaking with support', link: 'https://www.muellersportsmed.com/wrist-braces' },
  { name: 'Tremor Dampening Gloves', brand: 'Steadiwear', use: 'Mechanical stabilization of hand tremors', link: 'https://www.steadiwear.com/' },
  { name: 'Digital Tremor Analyzer', brand: 'TremorSense', use: 'Track tremor patterns over time', link: 'https://www.tremorsense.com/' }
],
'Seizures': [
  { name: 'Seizure Alert Device', brand: 'Embrace', use: 'Detect and alert during seizure activity', link: 'https://www.empatica.com/embrace2/' },
  { name: 'Bed Movement Monitor', brand: 'Medpage', use: 'Detect seizure movements during sleep', link: 'https://www.medpagestore.com/' },
  { name: 'Protective Headgear', brand: 'Ribcap', use: 'Protection during seizure falls', link: 'https://www.ribcap.com/' },
  { name: 'Medical ID Bracelet', brand: 'MedicAlert', use: 'Emergency information for first responders', link: 'https://www.medicalert.org/' }
],
'Confusion': [
  { name: 'Orientation Clock', brand: 'American Lifetime', use: 'Clear display of time, date, and day', link: 'https://www.americanlifetime.com/' },
  { name: 'GPS Tracking Device', brand: 'AngelSense', use: 'Location monitoring for wandering risk', link: 'https://www.angelsense.com/' },
  { name: 'Medication Management System', brand: 'MedMinder', use: 'Automated pill dispenser with reminders', link: 'https://www.medminder.com/' },
  { name: 'Glucose Monitor', brand: 'Dexcom', use: 'Check for low blood sugar causing confusion', link: 'https://www.dexcom.com/' }
],
'Memory Loss': [
  { name: 'Digital Memory Aid', brand: 'Reminder Rosie', use: 'Voice-activated reminder system', link: 'https://www.reminderrosie.com/' },
  { name: 'Brain Training System', brand: 'CogniFit', use: 'Cognitive exercise program', link: 'https://www.cognifit.com/' },
  { name: 'Memory Testing Device', brand: 'BrainCheck', use: 'At-home cognitive assessment', link: 'https://braincheck.com/' },
  { name: 'Location Tracker', brand: 'Tile', use: 'Find commonly misplaced items', link: 'https://www.thetileapp.com/' }
],
'Anxiety': [
  { name: 'Heart Rate Monitor', brand: 'Polar', use: 'Monitor stress levels through heart rate variability', link: 'https://www.polar.com/en' },
  { name: 'Biofeedback Device', brand: 'Muse', use: 'Brain-sensing meditation headband', link: 'https://choosemuse.com/' },
  { name: 'Stress Ball', brand: 'TheraBand', use: 'Physical outlet for stress and anxiety', link: 'https://www.theraband.com/' },
  { name: 'Anxiety Relief Bracelet', brand: 'TouchPoints', use: 'Haptic feedback to reduce stress', link: 'https://thetouchpointssolution.com/' }
],
'Depression': [
  { name: 'Light Therapy Lamp', brand: 'Philips', use: 'Improve mood with specific wavelength light', link: 'https://www.usa.philips.com/c-m-li/light-therapy/' },
  { name: 'Activity Tracker', brand: 'Fitbit', use: 'Encourage physical activity to manage symptoms', link: 'https://www.fitbit.com/global/in/home' },
  { name: 'Sunrise Alarm Clock', brand: 'Philips', use: 'Gentle awakening with natural light simulation', link: 'https://www.usa.philips.com/c-m-li/light-therapy/wake-up-light/' },
  { name: 'EEG Headset', brand: 'Emotiv', use: 'Monitor brain activity patterns', link: 'https://www.emotiv.com/' }
],
'Irritability': [
  { name: 'Stress Monitoring Watch', brand: 'Garmin', use: 'Track stress levels through heart rate variability', link: 'https://www.garmin.com/' },
  { name: 'White Noise Machine', brand: 'LectroFan', use: 'Create calming sound environment', link: 'https://www.soundofsleep.com/' },
  { name: 'Light Therapy Glasses', brand: 'Luminette', use: 'Regulate mood through light exposure', link: 'https://www.myluminette.com/' },
  { name: 'Aromatherapy Diffuser', brand: 'Vitruvi', use: 'Disperse calming essential oils', link: 'https://vitruvi.com/' }
],
'Difficulty Concentrating': [
  { name: 'Focus Neurofeedback Device', brand: 'Myndlift', use: 'Train attention through brainwave feedback', link: 'https://www.myndlift.com/' },
  { name: 'Noise-Canceling Headphones', brand: 'Bose', use: 'Block distracting environmental noise', link: 'https://www.bose.com/' },
  { name: 'Focus Lighting System', brand: 'Ario', use: 'Optimize lighting for concentration', link: 'https://www.arioliving.com/' },
  { name: 'Air Quality Monitor', brand: 'Awair', use: 'Check for poor air quality affecting cognition', link: 'https://getawair.com/' }
],
'Chest Tightness': [
  { name: 'Peak Flow Meter', brand: 'Microlife', use: 'Measure airflow from lungs', link: 'https://www.microlife.com/medical/respiratory-care/peak-flow-meter' },
  { name: 'Portable ECG Monitor', brand: 'KardiaMobile', use: 'Check heart rhythm', link: 'https://www.alivecor.com/' },
  { name: 'Pulse Oximeter', brand: 'Nonin', use: 'Monitor blood oxygen levels', link: 'https://www.nonin.com/' },
  { name: 'Respiration Rate Monitor', brand: 'Spire', use: 'Track breathing patterns', link: 'https://spirehealth.com/' }
],
'Wheezing': [
  { name: 'Peak Flow Meter', brand: 'Microlife', use: 'Monitor lung function and airflow', link: 'https://www.microlife.com/medical/respiratory-care/peak-flow-meter' },
  { name: 'Portable Spirometer', brand: 'Contec', use: 'Measure lung capacity and function', link: 'https://www.contecmed.com/product/category/38' },
  { name: 'Smart Inhaler Tracker', brand: 'Propeller Health', use: 'Track inhaler usage and effectiveness', link: 'https://www.propellerhealth.com/' },
  { name: 'Air Quality Monitor', brand: 'Awair', use: 'Detect airborne triggers for wheezing', link: 'https://getawair.com/' }
],
'Hives': [
  { name: 'Skin Temperature Monitor', brand: 'Exergen', use: 'Track skin temperature changes during reactions', link: 'https://www.exergen.com/' },
  { name: 'Digital Skin Camera', brand: 'HÜD', use: 'Document hive progression', link: 'https://www.hudderma.com/' },
  { name: 'Environmental Allergen Detector', brand: 'AirThings', use: 'Identify potential triggers', link: 'https://www.airthings.com/' },
  { name: 'Cooling Therapy Device', brand: 'Hilph', use: 'Provide drug-free itch relief', link: 'https://www.amazon.in/s?k=cooling+therapy+device' }
],
'Swollen Face': [
  { name: 'Facial Measurement Tool', brand: 'MediTouch', use: 'Track changes in facial swelling', link: 'https://www.amazon.in/s?k=facial+caliper' },
  { name: 'Cooling Face Mask', brand: 'Cryo-Max', use: 'Reduce inflammation with cold therapy', link: 'https://www.amazon.in/s?k=cooling+face+mask' },
  { name: 'Lymphatic Drainage Device', brand: 'ReFa', use: 'Stimulate lymphatic drainage in face', link: 'https://refausa.com/' },
  { name: 'Facial Moisture Analyzer', brand: 'Myskin', use: 'Monitor hydration levels in facial tissue', link: 'https://www.amazon.in/Skin-Moisture-Meter/s?k=Skin+Moisture+Meter' }
],
'Tongue Swelling': [
  { name: 'Oral Camera', brand: 'Depstech', use: 'Monitor tongue swelling progression', link: 'https://www.depstech.com/' },
  { name: 'Medical Alert Bracelet', brand: 'MedicAlert', use: 'Emergency information for allergic reactions', link: 'https://www.medicalert.org/' },
  { name: 'Epinephrine Auto-Injector Holder', brand: 'EpiPen', use: 'Accessible storage for emergency medication', link: 'https://www.epipen.com/' },
  { name: 'Tongue Measuring Guide', brand: 'MouthMetrics', use: 'Standardized measurement of tongue size', link: 'https://www.amazon.in/s?k=tongue+measuring+tool' }
],
'Hoarseness': [
  { name: 'Voice Analyzer', brand: 'Vocalis', use: 'Monitor voice quality and changes', link: 'https://vocalishealth.com/' },
  { name: 'Throat Visualization System', brand: 'Depstech', use: 'View vocal cord inflammation', link: 'https://www.depstech.com/' },
  { name: 'Ultrasonic Humidifier', brand: 'Levoit', use: 'Maintain optimal throat moisture', link: 'https://www.levoit.com/humidifiers' },
  { name: 'Voice Recorder', brand: 'Olympus', use: 'Track voice changes over time', link: 'https://www.olympus-imaging.co.in/' }
],
'Difficulty Swallowing': [
  { name: 'Swallow Assessment Device', brand: 'VitalStim', use: 'Electrical stimulation therapy for swallowing', link: 'https://www.vitalstim.com/' },
  { name: 'Throat Muscle Exercise Device', brand: 'SwallowStrong', use: 'Strengthen swallowing muscles', link: 'https://www.swallowstrong.com/' },
  { name: 'Modified Food Texture System', brand: 'Thick-It', use: 'Prepare foods with safe texture', link: 'https://www.thickit.com/' },
  { name: 'Throat Temperature Monitor', brand: 'HealthSpot', use: 'Detect inflammation affecting swallowing', link: 'https://www.amazon.in/s?k=medical+infrared+thermometer' }
],
'Burning Sensation in Chest': [
  { name: 'pH Monitoring System', brand: 'Bravo', use: 'Detect acid reflux episodes', link: 'https://www.givenimaging.com/' },
  { name: 'Chest Pain Diary Device', brand: 'HeartGuide', use: 'Record timing and factors of pain', link: 'https://www.omronhealthcare.com/heartguide' },
  { name: 'Wedge Pillow System', brand: 'MedSlant', use: 'Optimal positioning to prevent reflux', link: 'https://www.medslant.com/' },
  { name: 'Food Temperature Monitor', brand: 'ThermoPro', use: 'Avoid trigger foods that are too hot', link: 'https://buythermopro.com/' }
],
'Fainting': [
  { name: 'Mobile ECG Monitor', brand: 'KardiaMobile', use: 'Record heart activity before/after episodes', link: 'https://www.alivecor.com/' },
  { name: 'Blood Pressure Monitor Watch', brand: 'Omron', use: 'Track BP changes', link: 'https://www.omronhealthcare.com/' },
  { name: 'Fall Detection Device', brand: 'FallCall', use: 'Detect falls and alert emergency contacts', link: 'https://www.fallcall.com/' },
  { name: 'Event Monitor', brand: 'iRhythm', use: 'Long-term heart monitoring', link: 'https://www.irhythmtech.com/' }
],
'Numbness': [
  { name: 'Nerve Conduction Scanner', brand: 'NeuroMetrix', use: 'Home assessment of nerve function', link: 'https://www.neurometrix.com/' },
  { name: 'Circulation Booster', brand: 'Revitive', use: 'Improve blood flow to extremities', link: 'https://www.revitive.com/' },
  { name: 'Sensation Testing Kit', brand: 'SenseLabs', use: 'Test and document changes in sensation', link: 'https://www.amazon.in/s?k=monofilament+testing+kit' },
  { name: 'Vibration Therapy Device', brand: 'PowerPlate', use: 'Stimulate nerves and circulation', link: 'https://powerplate.com/' }
],
'Tingling': [
{ name: 'Nerve Stimulation Device', brand: 'TENS 7000', use: 'Stimulate nerves in affected areas', link: 'https://tens7000.com/' },
{ name: 'B12 Testing Kit', brand: 'Everlywell', use: 'Check for B12 deficiency causing tingling', link: 'https://www.everlywell.com/products/b-vitamins-test/' },
{ name: 'Compression Gloves', brand: 'Dr. Arthritis', use: 'Improve circulation and reduce hand tingling', link: 'https://www.doctorarthritis.org/collections/compression-gloves' },
{ name: 'Foot Massager with Heat', brand: 'Miko Shiatsu', use: 'Massage feet to reduce tingling from poor circulation', link: 'https://www.mikoproducts.com/products/miko-foot-massager' }
],

'Fever': [
{ name: 'Digital Thermometer', brand: 'Omron', use: 'Measure body temperature accurately', link: 'https://www.omronhealthcare.com/products/digital-thermometer-mc-246/' },
{ name: 'Infrared Thermometer', brand: 'Dr. Trust', use: 'Non-contact temperature check', link: 'https://drtrust.in/products/dr-trust-forehead-ear-digital-infrared-thermometer' },
{ name: 'Forehead Strip Thermometer', brand: 'Johnson & Johnson', use: 'Quick temperature assessment', link: 'https://www.jnj.com/healthcare-products/thermometers' },
{ name: 'Bluetooth Thermometer', brand: 'Kinsa', use: 'Track temperature with smartphone app', link: 'https://www.kinsahealth.com/' }
],
'Cough': [
{ name: 'Pulse Oximeter', brand: 'BPL', use: 'Monitor oxygen levels in blood', link: 'https://www.bplmedicaltechnologies.com/product/pulse-oximeter' },
{ name: 'Nebulizer', brand: 'Philips', use: 'Deliver medication to lungs for breathing issues', link: 'https://www.philips.co.in/c-p/HS1116_00/respironics-inno-spire-essence-compressor-nebulizer-system' },
{ name: 'Steam Inhaler', brand: 'Vicks', use: 'Provide warm moisture to ease congestion', link: 'https://www.vicks.com/en-us/shop-products/vaporizers-humidifiers/vicks-personal-steam-inhaler' },
{ name: 'Ultrasonic Humidifier', brand: 'Honeywell', use: 'Add moisture to air to reduce cough irritation', link: 'https://www.honeywellpluggedin.com/air/humidifiers' }
],
'Shortness of Breath': [
{ name: 'Pulse Oximeter', brand: 'Hesley', use: 'Track oxygen saturation levels', link: 'https://www.hesley.in/products/hesley-pulse-oximeter' },
{ name: 'Peak Flow Meter', brand: 'Cipla', use: 'Measure how fast air can be exhaled', link: 'https://www.cipla.com/product/respiratory/peak-flow-meter' },
{ name: 'Portable Oxygen Concentrator', brand: 'Inogen', use: 'Supplemental oxygen for severe cases', link: 'https://www.inogen.com/' },
{ name: 'Spirometer', brand: 'Microlife', use: 'Measure lung function', link: 'https://www.microlife.com/professional-products/spirometers' }
],
'Chest Pain': [
{ name: 'BP Monitor', brand: 'Omron', use: 'Measure blood pressure', link: 'https://www.omronhealthcare.com/products/blood-pressure-monitors/' },
{ name: 'ECG Monitor', brand: 'AliveCor', use: 'Track heart activity', link: 'https://www.alivecor.com/' },
{ name: 'Stethoscope', brand: 'Littmann', use: 'Listen to heart and lung sounds', link: 'https://www.littmann.com/' },
{ name: 'Heart Rate Monitor Watch', brand: 'Garmin', use: 'Continuous heart rate tracking', link: 'https://www.garmin.com/en-US/c/wearables/' }
],
'Headache': [
{ name: 'TENS Unit', brand: 'Dr. Physio', use: 'Relieve tension headaches with electrical stimulation', link: 'https://www.drphysio.in/products/dr-physio-electric-tens-therapy-machine' },
{ name: 'Acupressure Mat', brand: 'Spoonk', use: 'Relieve tension through pressure points', link: 'https://www.spoonkspace.com/' },
{ name: 'Head Massager', brand: 'Tezam', use: 'Release tension in scalp and head', link: 'https://www.tezam.com/' },
{ name: 'Cooling Gel Pack', brand: 'IcePax', use: 'Reduce inflammation and pain', link: 'https://www.icepax.com/' }
],
'Fatigue': [
{ name: 'Fitness Tracker', brand: 'Fitbit', use: 'Monitor sleep and activity patterns', link: 'https://www.fitbit.com/global/in/home' },
{ name: 'Smart Sleep Tracker', brand: 'Withings', use: 'Analyze sleep quality and cycles', link: 'https://www.withings.com/in/en/sleep' },
{ name: 'Light Therapy Lamp', brand: 'Verilux', use: 'Combat seasonal affective disorder', link: 'https://verilux.com/' },
{ name: 'Activity Monitor', brand: 'Garmin', use: 'Track daily activity levels', link: 'https://www.garmin.com/en-IN/c/wearables/' }
],
'Abdominal Pain': [
{ name: 'Heating Pad', brand: 'Flamingo', use: 'Soothe abdominal discomfort with heat', link: 'https://www.flamingohealth.com/product/flamingo-orthopaedic-heating-belt' },
{ name: 'TENS Unit', brand: 'Omron', use: 'Pain relief through electrical stimulation', link: 'https://www.omronhealthcare.com/products/pain-management/' },
{ name: 'Abdominal Support Belt', brand: 'Wonder Care', use: 'Provide support for abdominal muscles', link: 'https://www.wondercare.in/' },
{ name: 'Therapeutic Massage Belt', brand: 'Caresmith', use: 'Relieve muscular tension in abdomen', link: 'https://www.caresmith.in/' }
],
'Dizziness': [
{ name: 'Ear Thermometer', brand: 'Braun', use: 'Check for fever-related causes of dizziness', link: 'https://www.braunhealthcare.com/us_en/thermometers' },
{ name: 'BP Monitor', brand: 'Omron', use: 'Check for low blood pressure', link: 'https://www.omronhealthcare.com/products/blood-pressure-monitors/' },
{ name: 'Glucose Monitor', brand: 'Accu-Chek', use: 'Check for low blood sugar', link: 'https://www.accu-chek.com/' },
{ name: 'Balance Training System', brand: 'TheraGear', use: 'Improve vestibular function', link: 'https://www.theragear.com/' }
],


'Joint Pain': [
    { name: 'Knee Brace', brand: 'Vissco', use: 'Support joint stability and reduce pain', link: 'https://www.vissco.com/product-category/orthopedic-supports/knee-supports/' },
    { name: 'Electric Massager', brand: 'JSB', use: 'Relieve muscle stiffness around joints', link: 'https://www.jsbhealthcare.com/product-category/massagers/' },
    { name: 'Hot/Cold Therapy Wrap', brand: 'Thermedic', use: 'Apply temperature therapy to affected joints', link: 'https://www.thermedic.com/products' },
    { name: 'Compression Sleeves', brand: 'Tynor', use: 'Reduce inflammation and support joints', link: 'https://www.tynor.in/product-category/compression-supports/' }
],
'Rash': [
    { name: 'Skin Scanner', brand: 'DermaScope', use: 'Examine skin conditions in detail', link: 'https://www.dermascope.com/products' },
    { name: 'UV Protection Meter', brand: 'Solarmeter', use: 'Measure UV exposure for sensitive skin', link: 'https://www.solarmeter.com/' },
    { name: 'Skin Moisture Analyzer', brand: 'Derma H20', use: 'Assess skin hydration levels', link: 'https://www.derma-h20.com/' },
    { name: 'Cool Mist Humidifier', brand: 'Levoit', use: 'Maintain optimal humidity for skin health', link: 'https://www.levoit.com/collections/humidifiers' }
],
'Blood in Urine': [
    { name: 'Urine Test Strips', brand: 'Bayer', use: 'Check for blood, proteins, and infections', link: 'https://www.bayer.com/en/products/urinalysis' },
    { name: 'Digital Urinalysis Device', brand: 'Healthy.io', use: 'Smartphone-based urinalysis', link: 'https://healthy.io/product/urinalysis/' },
    { name: 'At-home UTI Test', brand: 'AZO', use: 'Detect urinary tract infections', link: 'https://www.azoproducts.com/product/uti-test-strips/' },
    { name: 'Digital Microscope', brand: 'QBC', use: 'Examine urine sediment', link: 'https://www.qbcdiagnostics.com/products/microscopes/' }
],
'Frequent Urination': [
    { name: 'Bladder Scanner', brand: 'PortaScan', use: 'Monitor bladder health non-invasively', link: 'https://www.portascan.com/' },
    { name: 'Pelvic Floor Trainer', brand: 'Elvie', use: 'Strengthen pelvic floor muscles', link: 'https://www.elvie.com/en-us/shop/elvie-trainer' },
    { name: 'Biofeedback Device', brand: 'PeriCoach', use: 'Train bladder control', link: 'https://www.pericoach.com/' },
    { name: 'Glucose Monitor', brand: 'FreeStyle', use: 'Check for diabetes-related causes', link: 'https://www.myfreestyle.com/freestyle-libre' }
],
'Sleeplessness': [
    { name: 'Sleep Monitor', brand: 'Withings', use: 'Track sleep patterns and quality', link: 'https://www.withings.com/us/en/sleep' },
    { name: 'White Noise Machine', brand: 'Homedics', use: 'Create optimal sound environment for sleep', link: 'https://www.homedics.com/sound-machines/' },
    { name: 'Light Therapy Glasses', brand: 'Luminette', use: 'Regulate circadian rhythm', link: 'https://www.luminette.us/' },
    { name: 'Sleep Quality Monitor', brand: 'Beddit', use: 'Track sleep stages throughout the night', link: 'https://www.apple.com/' }
],
'Anxiety': [
    { name: 'Heart Rate Monitor', brand: 'Polar', use: 'Monitor stress levels through heart rate variability', link: 'https://www.polar.com/us-en/products' },
    { name: 'Biofeedback Device', brand: 'Muse', use: 'Brain-sensing meditation headband', link: 'https://choosemuse.com/' },
    { name: 'Stress Ball', brand: 'TheraBand', use: 'Physical outlet for stress and anxiety', link: 'https://www.theraband.com/products/stress-balls' },
    { name: 'Anxiety Relief Bracelet', brand: 'TouchPoints', use: 'Haptic feedback to reduce stress', link: 'https://thetouchpointsolution.com/' }
],
'Depression': [
    { name: 'Light Therapy Lamp', brand: 'Philips', use: 'Improve mood with specific wavelength light', link: 'https://www.usa.philips.com/c-m-pe/light-therapy' },
    { name: 'Activity Tracker', brand: 'Fitbit', use: 'Encourage physical activity to manage symptoms', link: 'https://www.fitbit.com/global/us/home' },
    { name: 'Sunrise Alarm Clock', brand: 'Philips', use: 'Gentle awakening with natural light simulation', link: 'https://www.usa.philips.com/c-m-pe/wake-up-light' },
    { name: 'EEG Headset', brand: 'Emotiv', use: 'Monitor brain activity patterns', link: 'https://www.emotiv.com/' }
],
'Back Pain': [
    { name: 'Posture Corrector', brand: 'Tynor', use: 'Support spine alignment during activities', link: 'https://www.tynor.in/product-category/back-supports/' },
    { name: 'Lumbar Support Belt', brand: 'Flamingo', use: 'Reduce lower back strain and provide support', link: 'https://www.flamingohealth.com/product/lumbar-support-belt/' },
    { name: 'TENS Unit', brand: 'Omron', use: 'Electrical stimulation for pain management', link: 'https://www.omronhealthcare.com/products/pain-management/' },
    { name: 'Acupressure Mat', brand: 'ProsourceFit', use: 'Stimulate pressure points along the spine', link: 'https://prosourcefit.com/collections/acupressure' }
],
'Blur of Vision': [
    { name: 'Eye Massager', brand: 'iCare', use: 'Relieve eye strain with gentle massage', link: 'https://www.icareworld.com/products/eye-massager' },
    { name: 'Visual Acuity Chart', brand: 'Snellen', use: 'Self-monitor vision changes', link: 'https://www.precision-vision.com/products/snellen-charts/' },
    { name: 'Eye Drops Dispenser', brand: 'OptiDrop', use: 'Precisely administer eye drops', link: 'https://www.optilife.com/' },
    { name: 'Blue Light Blocking Glasses', brand: 'Gunnar', use: 'Reduce digital eye strain', link: 'https://gunnar.com/' }
],
'Earache': [
    { name: 'Otoscope', brand: 'Dr. Morepen', use: 'Examine ear canal for issues', link: 'https://www.drmorepen.com/collections/diagnostic-devices' },
    { name: 'Ear Irrigation System', brand: 'Elephant Ear', use: 'Safe ear cleaning at home', link: 'https://www.elephantear.com/' },
    { name: 'Ear Thermometer', brand: 'Braun', use: 'Temperature measurement via ear', link: 'https://www.braunhealthcare.com/us_en/thermometers' },
    { name: 'Hearing Amplifier', brand: 'Banglijian', use: 'Temporary hearing assistance', link: 'https://www.banglijian.com/products' }
],
'Swollen Ankles': [
    { name: 'Compression Socks', brand: 'Sigvaris', use: 'Improve circulation in lower extremities', link: 'https://www.sigvaris.com/en-us/products/compression-socks' },
    { name: 'Foot Elevation Pillow', brand: 'Lounge Doctor', use: 'Proper elevation to reduce swelling', link: 'https://www.loungedoctor.com/products/leg-rest-pillow' },
    { name: 'Ankle Brace', brand: 'Mueller', use: 'Support swollen ankles during movement', link: 'https://www.muellersportsmed.com/products/ankle-braces' },
    { name: 'Digital Foot Scanner', brand: 'Dr. Scholls', use: 'Analyze pressure points and swelling', link: 'https://www.drscholls.com/custom-fit-kiosk/' }
],
'Constipation': [
    { name: 'Biofeedback Device', brand: 'PelvicTech', use: 'Improve bowel function through training', link: 'https://www.pelvictech.com/' },
    { name: 'Squatty Potty', brand: 'Squatty Potty', use: 'Improve posture for easier bowel movements', link: 'https://www.squattypotty.com/' },
    { name: 'Abdominal Massage Device', brand: 'Naipo', use: 'Stimulate intestinal movement', link: 'https://www.naipo.com/collections/massagers' },
    { name: 'Hydration Reminder Bottle', brand: 'Hidrate', use: 'Ensure adequate fluid intake', link: 'https://hidratespark.com/' }
],
'Nausea': [
    { name: 'Acupressure Wristband', brand: 'Sea-Band', use: 'Reduce nausea through pressure points', link: 'https://www.sea-band.com/' },
    { name: 'Essential Oil Diffuser', brand: 'Urpower', use: 'Disperse anti-nausea scents like peppermint', link: 'https://www.urpower.com/collections/diffusers' },
    { name: 'Nausea Relief Drops', brand: 'UpSpring', use: 'Provide quick relief from nausea symptoms', link: 'https://www.upspringbaby.com/collections/nausea-relief' },
    { name: 'Smart Water Bottle', brand: 'Hidrate', use: 'Maintain proper hydration during nausea', link: 'https://hidratespark.com/' }
],
'Dry Skin': [
    { name: 'Humidifier', brand: 'Levoit', use: 'Maintain optimal air moisture for skin health', link: 'https://www.levoit.com/collections/humidifiers' },
    { name: 'Skin Moisture Meter', brand: 'Myskin', use: 'Monitor skin hydration levels', link: 'https://www.myskin.com/' },
    { name: 'Hygrometer', brand: 'ThermoPro', use: 'Monitor room humidity levels', link: 'https://buythermopro.com/products/hygrometers' },
    { name: 'UV Protection Meter', brand: 'Solarmeter', use: 'Measure UV exposure that can dry skin', link: 'https://www.solarmeter.com/' }
],
'Tremors': [
    { name: 'Weighted Utensils', brand: 'Liftware', use: 'Stabilize hand movements during eating', link: 'https://www.liftware.com/' },
    { name: 'Wrist Stabilizer', brand: 'Mueller', use: 'Reduce hand shaking with support', link: 'https://www.muellersportsmed.com/products/wrist-braces' },
    { name: 'Tremor Dampening Gloves', brand: 'Steadiwear', use: 'Mechanical stabilization of hand tremors', link: 'https://steadiwear.com/' },
    { name: 'Digital Tremor Analyzer', brand: 'TremorSense', use: 'Track tremor patterns over time', link: 'https://www.tremorsense.com/' }
],
'Wheezing': [
    { name: 'Peak Flow Meter', brand: 'Microlife', use: 'Monitor lung function and airflow', link: 'https://www.microlife.com/consumer-products/respiratory-care/peak-flow-meters' },
    { name: 'Portable Spirometer', brand: 'Contec', use: 'Measure lung capacity and function', link: 'https://www.contecmed.com/product/portable-spirometer' },
    { name: 'Smart Inhaler Tracker', brand: 'Propeller Health', use: 'Track inhaler usage and effectiveness', link: 'https://www.propellerhealth.com/' },
    { name: 'Air Quality Monitor', brand: 'Awair', use: 'Detect airborne triggers for wheezing', link: 'https://www.getawair.com/' }
],
'Muscle Pain': [
    { name: 'Percussion Massage Gun', brand: 'Theragun', use: 'Deep tissue massage for muscle recovery', link: 'https://www.theragun.com/us/en-us/' },
    { name: 'TENS/EMS Unit', brand: 'Compex', use: 'Electrical stimulation for pain relief and muscle recovery', link: 'https://www.compex.com/' },
    { name: 'Foam Roller', brand: 'TriggerPoint', use: 'Self-myofascial release for tight muscles', link: 'https://www.tptherapy.com/collections/foam-rollers' },
    { name: 'Infrared Heat Therapy Wrap', brand: 'UTK', use: 'Deep penetrating heat for muscle relaxation', link: 'https://www.utktechnology.com/collections/heating-pads' }
],
'Nasal Congestion': [
    { name: 'Nasal Irrigation System', brand: 'NeilMed', use: 'Flush nasal passages to clear congestion', link: 'https://www.neilmed.com/usa/sinus-rinse.php' },
    { name: 'Nasal Dilator Strips', brand: 'Breathe Right', use: 'Open nasal passages during sleep', link: 'https://www.breatheright.com/' },
    { name: 'Portable Steam Inhaler', brand: 'Mabis', use: 'Provide warm moisture to clear congestion', link: 'https://www.mabishealthcare.com/products/steam-inhalers' },
    { name: 'Air Purifier', brand: 'Honeywell', use: 'Remove allergens that cause congestion', link: 'https://www.honeywellpluggedin.com/air/air-purifiers' }
],
'Irregular Periods': [
    { name: 'Ovulation Tracker', brand: 'Clearblue', use: 'Monitor fertility cycles', link: 'https://www.clearblue.com/ovulation-tests' },
    { name: 'Basal Body Thermometer', brand: 'iProven', use: 'Track subtle temperature changes', link: 'https://www.iproven.com/collections/thermometers' },
    { name: 'Period Tracking Device', brand: 'Tempdrop', use: 'Monitor menstrual cycle patterns', link: 'https://www.tempdrop.com/' },
    { name: 'Hormone Test Kit', brand: 'EverlyWell', use: 'At-home hormone level testing', link: 'https://www.everlywell.com/products/womens-hormone-test/' }
],
'Digestive Issues': [
    { name: 'Food Intolerance Test', brand: 'Everlywell', use: 'Identify potential food sensitivities', link: 'https://www.everlywell.com/products/food-sensitivity-test/' },
    { name: 'Smart Water Bottle', brand: 'Hidrate', use: 'Track hydration for digestive health', link: 'https://hidratespark.com/' },
    { name: 'Abdominal Massage Device', brand: 'Viktor Jurgen', use: 'Stimulate digestive movement', link: 'https://www.viktorjurgen.com/collections/massagers' },
    { name: 'Probiotic Fermenter', brand: 'Cultures for Health', use: 'Create probiotic-rich foods at home', link: 'https://www.culturesforhealth.com/collections/fermentation-kits' }
]

  
};

// 150+ Online diagnostics
const testMappings = {
  
    'Fever': [
      { test: 'Complete Blood Count (CBC)', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Dengue NS1 Antigen', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Malaria Parasite Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'COVID-19 RT-PCR', provider: 'Metropolis', link: 'https://www.metropolisindia.com/' }
    ],
    'Cough': [
      { test: 'Chest X-Ray', provider: 'Healthians', link: 'https://www.healthians.com/' },
      { test: 'Sputum Culture', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Lung Function Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Tuberculosis Test', provider: 'Metropolis', link: 'https://www.metropolisindia.com/' }
    ],
    'Chest Pain': [
      { test: 'ECG', provider: 'Max Lab', link: 'https://www.maxlab.co.in/' },
      { test: 'Treadmill Test (TMT)', provider: 'Fortis Labs', link: 'https://www.fortishealthcare.com/' },
      { test: 'Troponin Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Echocardiogram', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Abdominal Pain': [
      { test: 'Ultrasound Abdomen', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Liver Function Test (LFT)', provider: 'Metropolis', link: 'https://www.metropolisindia.com/' },
      { test: 'Stool Analysis', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'H. Pylori Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Joint Pain': [
      { test: 'Rheumatoid Factor (RA)', provider: '1mg Labs', link: 'https://www.1mg.com/labs' },
      { test: 'Uric Acid Test', provider: 'Redcliffe Labs', link: 'https://redcliffelabs.com/' },
      { test: 'CRP (C-Reactive Protein)', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Vitamin D Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Fatigue': [
      { test: 'Vitamin D Test', provider: 'Pharmeasy Diagnostics', link: 'https://pharmeasy.in/diagnostics' },
      { test: 'Thyroid Profile', provider: 'Medlife Labs', link: 'https://www.medlife.com/' },
      { test: 'Ferritin Test', provider: 'Healthians', link: 'https://www.healthians.com/' },
      { test: 'Vitamin B12 Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Headache': [
      { test: 'MRI Brain', provider: 'Tata Health', link: 'https://www.tatahealth.com/' },
      { test: 'CT Scan Head', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'Sinus X-ray', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Eye Examination', provider: 'Vasan Eye Care', link: 'https://www.vasaneye.in/' }
    ],
    'Dizziness': [
      { test: 'Blood Pressure Monitoring', provider: 'Portea', link: 'https://www.portea.com/' },
      { test: 'Inner Ear Function Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Blood Glucose Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Hemoglobin Test', provider: '1mg Labs', link: 'https://www.1mg.com/labs' }
    ],
    'Shortness of Breath': [
      { test: 'Pulmonary Function Test', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' },
      { test: 'Chest X-ray', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'D-dimer Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Arterial Blood Gas', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' }
    ],
    'Difficulty Breathing': [
      { test: 'Pulmonary Function Test', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Chest X-ray', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Echocardiogram', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'CT Scan Chest', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' }
    ],
    'Nausea': [
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Liver Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Pregnancy Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Ultrasound Abdomen', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Chills': [
      { test: 'Complete Blood Count', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Blood Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Malaria Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Urine Analysis', provider: 'Metropolis', link: 'https://www.metropolisindia.com/' }
    ],
    'Muscle Pain': [
      { test: 'CPK Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Vitamin D Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'ESR Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Electrolyte Panel', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Rash': [
      { test: 'Allergy Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Skin Biopsy', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' },
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'ANA Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Itching': [
      { test: 'Allergy Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Liver Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Kidney Function Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Skin Scraping for Fungus', provider: 'Metropolis', link: 'https://www.metropolisindia.com/' }
    ],
    'Palpitations': [
      { test: 'ECG', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Holter Monitoring', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Electrolyte Panel', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Diarrhea': [
      { test: 'Stool Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Stool for Ova and Parasites', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Food Intolerance Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Celiac Disease Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Constipation': [
      { test: 'Colonoscopy', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Abdominal X-ray', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Anorectal Manometry', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' }
    ],
    'Vomiting': [
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Electrolyte Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Upper GI Endoscopy', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Pregnancy Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Loss of Appetite': [
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Liver Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Thyroid Function Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Upper GI Endoscopy', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Weight Loss': [
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Blood Glucose Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Stool for Occult Blood', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Weight Gain': [
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Insulin Resistance Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Cortisol Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'PCOS Panel (for women)', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' }
    ],
    'Night Sweats': [
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Tuberculosis Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'HIV Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Swollen Lymph Nodes': [
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Lymph Node Biopsy', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Tuberculosis Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'HIV Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Sleeplessness': [
      { test: 'Sleep Study', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Vitamin D Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Cortisol Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' }
    ],
    'Excessive Sleepiness': [
      { test: 'Sleep Study', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Vitamin B12 Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' }
    ],
    'Blur of Vision': [
      { test: 'Comprehensive Eye Exam', provider: 'Vasan Eye Care', link: 'https://www.vasaneye.in/' },
      { test: 'Blood Glucose Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Blood Pressure Check', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'MRI Brain', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Eye Pain': [
      { test: 'Comprehensive Eye Exam', provider: 'Vasan Eye Care', link: 'https://www.vasaneye.in/' },
      { test: 'Intraocular Pressure Test', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Corneal Topography', provider: 'Centre for Sight', link: 'https://www.centreforsight.net/' },
      { test: 'MRI Orbit', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Hearing Loss': [
      { test: 'Audiometry', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Tympanometry', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'Otoscopy', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' },
      { test: 'MRI Brain', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Earache': [
      { test: 'Otoscopy', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Ear Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Tympanometry', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'CT Scan Temporal Bone', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Tinnitus': [
      { test: 'Audiometry', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Tinnitus Evaluation', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'MRI Brain', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Blood Pressure Monitoring', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Nosebleed': [
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Coagulation Profile', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Nasal Endoscopy', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Blood Pressure Monitoring', provider: 'Portea', link: 'https://www.portea.com/' }
    ],
    'Runny Nose': [
      { test: 'Allergy Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Nasal Smear', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Nasal Endoscopy', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Sinus X-ray', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' }
    ],
    'Sneezing': [
      { test: 'Allergy Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'IgE Level', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Nasal Smear', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Environmental Allergen Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' }
    ],
    'Swollen Ankles': [
      { test: 'Kidney Function Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Echocardiogram', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Venous Doppler', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Liver Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Back Pain': [
      { test: 'X-ray Spine', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'MRI Spine', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Bone Density Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Vitamin D Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Neck Pain': [
      { test: 'X-ray Cervical Spine', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'MRI Cervical Spine', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Electromyography', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Shoulder Pain': [
      { test: 'X-ray Shoulder', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'MRI Shoulder', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Ultrasound Shoulder', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'ESR Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Knee Pain': [
      { test: 'X-ray Knee', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'MRI Knee', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Uric Acid Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'ESR Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' }
    ],
    'Dry Mouth': [
      { test: 'Blood Glucose Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Sjögren\'s Antibody Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Salivary Gland Function Test', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' }
    ],
    'Excessive Thirst': [
      { test: 'Blood Glucose Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'HbA1c Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Electrolyte Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Kidney Function Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Frequent Urination': [
      { test: 'Urinalysis', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Blood Glucose Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Urine Culture', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Pelvic Ultrasound', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Painful Urination': [
      { test: 'Urinalysis', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Urine Culture', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'STI Panel', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Ultrasound Pelvis', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Blood in Urine': [
      { test: 'Urinalysis', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Urine Culture', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Ultrasound Pelvis', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Cystoscopy', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' }
    ],
    'Loss of Smell': [
      { test: 'Nasal Endoscopy', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'MRI Brain', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'CT Scan Sinuses', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'COVID-19 Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Loss of Taste': [
      { test: 'Taste Function Test', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Zinc Level Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Vitamin B12 Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'COVID-19 Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Mouth Ulcers': [
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Vitamin B12 Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Iron Level Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'HSV Culture', provider: 'Metropolis', link: 'https://www.metropolisindia.com/' }
    ],
    'Bad Breath': [
      { test: 'Dental Examination', provider: 'Apollo Dental', link: 'https://www.apollodentalclinic.com/' },
      { test: 'H. Pylori Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Sinus X-ray', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'Liver Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Gum Bleeding': [
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Vitamin C Level', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Platelet Count', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Coagulation Profile', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Hair Loss': [
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Ferritin Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Hormone Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Vitamin D Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Dry Skin': [
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Vitamin D Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Blood Glucose Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Zinc Level Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Bruising Easily': [
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Coagulation Profile', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Platelet Function Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Vitamin K Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Yellowing of Skin': [
      { test: 'Liver Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Bilirubin Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Hepatitis Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Abdominal Ultrasound', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Tremors': [
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'MRI Brain', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Electrolyte Panel', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Heavy Metal Screening', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Seizures': [
      { test: 'EEG', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'MRI Brain', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Electrolyte Panel', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Toxicology Screen', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Confusion': [
      { test: 'MRI Brain', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Electrolyte Panel', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Vitamin B12 Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Blood Glucose Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' }
    ],
    'Memory Loss': [
      { test: 'MRI Brain', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Cognitive Assessment', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Vitamin B12 Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Anxiety': [
      { test: 'Psychological Assessment', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Cortisol Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'ECG', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Depression': [
      { test: 'Psychological Assessment', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Vitamin D Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Vitamin B12 Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Irritability': [
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Blood Glucose Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Cortisol Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Psychological Assessment', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' }
    ],
    'Difficulty Concentrating': [
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Vitamin B12 Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Blood Glucose Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Sleep Study', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Chest Tightness': [
      { test: 'ECG', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Chest X-ray', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Pulmonary Function Test', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' },
      { test: 'Stress Test', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Wheezing': [
      { test: 'Pulmonary Function Test', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Chest X-ray', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Allergy Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'IgE Level Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Hives': [
      { test: 'Allergy Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'IgE Level Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Food Intolerance Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Swollen Face': [
      { test: 'Allergy Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Kidney Function Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'C1 Esterase Inhibitor Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Tongue Swelling': [
      { test: 'Allergy Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'C1 Esterase Inhibitor Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Food Allergy Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Hoarseness': [
      { test: 'Laryngoscopy', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Chest X-ray', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Voice Analysis', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' }
    ],
    'Difficulty Swallowing': [
      { test: 'Barium Swallow Study', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Endoscopy', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Esophageal Manometry', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Burning Sensation in Chest': [
      { test: 'Upper GI Endoscopy', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'ECG', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: '24-Hour pH Monitoring', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'H. Pylori Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Fainting': [
      { test: 'ECG', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Echocardiogram', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Tilt Table Test', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' },
      { test: 'Blood Glucose Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Numbness': [
      { test: 'MRI Spine/Brain', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Nerve Conduction Study', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Vitamin B12 Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Blood Glucose Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Tingling': [
      { test: 'Nerve Conduction Study', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Vitamin B12 Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Blood Glucose Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'MRI Spine/Brain', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Excessive Sweating': [
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Blood Glucose Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Hormone Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Sweat Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Cold Hands or Feet': [
      { test: 'Vascular Doppler Study', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Complete Blood Count', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'ANA Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Brittle Nails': [
      { test: 'Iron Profile', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Vitamin D Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Calcium Level Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Muscle Cramping': [
      { test: 'Electrolyte Panel', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Vitamin D Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Calcium Level Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Magnesium Level Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Ankle Pain': [
      { test: 'X-ray Ankle', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'MRI Ankle', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Uric Acid Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Ultrasound Ankle', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' }
    ],
    'Wrist Pain': [
      { test: 'X-ray Wrist', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'MRI Wrist', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Nerve Conduction Study', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Rheumatoid Factor', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Hip Pain': [
      { test: 'X-ray Hip', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'MRI Hip', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Bone Density Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Vitamin D Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Stiffness': [
      { test: 'ESR/CRP Tests', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Rheumatoid Factor', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Vitamin D Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'ANA Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Swollen Joints': [
      { test: 'Rheumatoid Factor', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Uric Acid Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'ESR/CRP Tests', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Joint Fluid Analysis', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Foot Pain': [
      { test: 'X-ray Foot', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'MRI Foot', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Uric Acid Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Ultrasound Foot', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' }
    ],
    'Difficulty Walking': [
      { test: 'MRI Spine/Brain', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Nerve Conduction Study', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Vitamin B12 Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Gait Analysis', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' }
    ],
    'Eye Discharge': [
      { test: 'Eye Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Comprehensive Eye Exam', provider: 'Vasan Eye Care', link: 'https://www.vasaneye.in/' },
      { test: 'Tear Film Test', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Allergy Test Panel', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Eye Redness': [
      { test: 'Comprehensive Eye Exam', provider: 'Vasan Eye Care', link: 'https://www.vasaneye.in/' },
      { test: 'Eye Pressure Test', provider: 'Centre for Sight', link: 'https://www.centreforsight.net/' },
      { test: 'Allergy Test Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Eye Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Swollen Eyelids': [
      { test: 'Allergy Test Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Comprehensive Eye Exam', provider: 'Vasan Eye Care', link: 'https://www.vasaneye.in/' },
      { test: 'Eye Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Ear Discharge': [
      { test: 'Ear Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Audiometry Test', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Tympanometry', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'CT Scan Temporal Bone', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Ear Fullness': [
      { test: 'Tympanometry', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Audiometry Test', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'CT Scan Temporal Bone', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Nasal Endoscopy', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' }
    ],
    'Itchy Ears': [
      { test: 'Ear Examination', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Ear Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Allergy Test Panel', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Fungal Culture', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Facial Pain': [
      { test: 'Sinus CT Scan', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Dental X-ray', provider: 'Apollo Dental', link: 'https://www.apollodentalclinic.com/' },
      { test: 'MRI Brain', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'Trigeminal Nerve Test', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' }
    ],
    'Jaw Pain': [
      { test: 'Dental X-ray', provider: 'Apollo Dental', link: 'https://www.apollodentalclinic.com/' },
      { test: 'TMJ MRI', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Jaw CT Scan', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'Bite Analysis', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' }
    ],
    'Bleeding Gums': [
      { test: 'Complete Blood Count', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Vitamin C Level', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Coagulation Profile', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Oral Examination', provider: 'Apollo Dental', link: 'https://www.apollodentalclinic.com/' }
    ],
    'Toothache': [
      { test: 'Dental X-ray', provider: 'Apollo Dental', link: 'https://www.apollodentalclinic.com/' },
      { test: 'Dental CT Scan', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'Pulp Vitality Test', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' },
      { test: 'Oral Examination', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' }
    ],
    'Frequent Coughing': [
      { test: 'Chest X-ray', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Pulmonary Function Test', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' },
      { test: 'Sputum Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Allergy Test Panel', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Coughing Blood': [
      { test: 'Chest X-ray', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'CT Scan Chest', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Bronchoscopy', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' },
      { test: 'Sputum Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Nasal Congestion': [
      { test: 'Sinus X-ray', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Nasal Endoscopy', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Allergy Test Panel', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'CT Scan Sinuses', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' }
    ],
    'Post-Nasal Drip': [
      { test: 'Nasal Endoscopy', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Allergy Test Panel', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Sinus CT Scan', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'Sinus X-ray', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Increased Heart Rate': [
      { test: 'ECG', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Holter Monitoring', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Electrolyte Panel', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Sexual Dysfunction': [
      { test: 'Hormone Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Blood Glucose Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Testosterone Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Doppler Ultrasound', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Irregular Periods': [
      { test: 'Hormone Panel', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Pelvic Ultrasound', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Prolactin Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Breast Pain': [
      { test: 'Breast Ultrasound', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Mammogram', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Hormone Panel', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Prolactin Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Menstrual Cramps': [
      { test: 'Pelvic Ultrasound', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Hormone Panel', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'CA-125 Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Laparoscopy', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Vaginal Discharge': [
      { test: 'Vaginal Swab Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Pap Smear', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'STI Panel', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Pelvic Ultrasound', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Vaginal Itching': [
      { test: 'Vaginal Swab Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Vaginal pH Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'STI Panel', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Blood Glucose Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Testicular Pain': [
      { test: 'Testicular Ultrasound', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Urine Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'STI Panel', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Doppler Ultrasound', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Blood in Stool': [
      { test: 'Stool Occult Blood Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Colonoscopy', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Complete Blood Count', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Sigmoidoscopy', provider: 'Medanta', link: 'https://www.medanta.org/' }
    ],
    'Heartburn': [
      { test: 'Upper GI Endoscopy', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: '24-Hour pH Monitoring', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Barium Swallow', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'H. Pylori Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Bloating': [
      { test: 'Abdominal Ultrasound', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Hydrogen Breath Test', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Celiac Disease Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Food Intolerance Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' }
    ],
    'Flatulence': [
      { test: 'Hydrogen Breath Test', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Food Intolerance Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Stool Analysis', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Celiac Disease Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Incontinence': [
      { test: 'Urodynamic Testing', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'Pelvic Ultrasound', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Urinalysis', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Cystoscopy', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' }
    ],
    'Low Back Pain': [
      { test: 'X-ray Lumbar Spine', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'MRI Lumbar Spine', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Bone Density Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'EMG', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' }
    ],
    'Swollen Glands': [
      { test: 'Complete Blood Count', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Ultrasound Lymph Nodes', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Monospot Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Lymph Node Biopsy', provider: 'Fortis Healthcare', link: 'https://www.fortishealthcare.com/' }
    ],
    'Skin Ulcers': [
      { test: 'Wound Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Skin Biopsy', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Vascular Doppler Study', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Blood Glucose Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Genital Sores': [
      { test: 'STI Panel', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Herpes Culture/PCR', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Syphilis Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'HIV Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
  'Genital Sores': [
      { test: 'STI Panel', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Herpes Culture/PCR', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Syphilis Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'HIV Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Excessive Gas': [
      { test: 'Hydrogen Breath Test', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Food Intolerance Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Lactose Intolerance Test', provider: 'SRL Diagnostics', link: 'https://www.srlworld.com/' },
      { test: 'Stool Analysis', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Indigestion': [
      { test: 'Upper GI Endoscopy', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'H. Pylori Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Abdominal Ultrasound', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Liver Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' }
    ],
    'Reduced Appetite': [
      { test: 'Complete Blood Count', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Thyroid Function Test', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Liver Function Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
  ],
  
   'Eye Strain': [
      { test: 'Comprehensive Eye Exam', provider: 'Vasan Eye Care', link: 'https://www.vasaneye.in/' },
      { test: 'Refraction Test', provider: 'Centre for Sight', link: 'https://www.centreforsight.net/' },
      { test: 'Binocular Vision Assessment', provider: 'Sankara Nethralaya', link: 'https://sankaranethralaya.org/' },
      { test: 'Computer Vision Syndrome Assessment', provider: 'Dr. Agarwal\'s Eye Hospital', link: 'https://www.dragarwal.com/' }
    ],
    'Loss of Balance': [
      { test: 'Neurological Examination', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'MRI Brain', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Vestibular Function Tests', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'Vitamin B12 Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Loss of Coordination': [
      { test: 'Neurological Examination', provider: 'Apollo Hospitals', link: 'https://www.apollohospitals.com/' },
      { test: 'MRI Brain', provider: 'Medanta', link: 'https://www.medanta.org/' },
      { test: 'Cerebellar Function Tests', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' },
      { test: 'Vitamin E Test', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' }
    ],
    'Sore Throat': [
      { test: 'Throat Culture', provider: 'Dr. Lal PathLabs', link: 'https://www.lalpathlabs.com/' },
      { test: 'Rapid Strep Test', provider: 'Apollo Diagnostics', link: 'https://www.apollodiagnostics.in/' },
      { test: 'Complete Blood Count', provider: 'Thyrocare', link: 'https://www.thyrocare.com/' },
      { test: 'Throat Examination', provider: 'Max Healthcare', link: 'https://www.maxhealthcare.in/' }
    ]
  };
  
  
  

// 30+ Online medicine shops in India
const medicineShops = [
  { name: '1mg', link: 'https://www.1mg.com/' },
  { name: 'Pharmeasy', link: 'https://pharmeasy.in/' },
  { name: 'Netmeds', link: 'https://www.netmeds.com/' },
  { name: 'Apollo Pharmacy', link: 'https://www.apollopharmacy.in/' },
  { name: 'Medlife', link: 'https://www.medlife.com/' },
  { name: 'Practo Pharmacy', link: 'https://www.practo.com/pharmacy' },
  { name: 'Medplus Mart', link: 'https://www.medplusmart.com/' },
  { name: 'Myra Medicines', link: 'https://www.myramedicines.com/' },
  { name: 'CareOnGo', link: 'https://www.careongo.com/' },
  { name: 'Healthmug', link: 'https://www.healthmug.com/' },
  { name: 'Medidart', link: 'https://www.medidart.com/' },
  { name: 'SaveOnMedicals', link: 'https://www.saveonmedicals.com/' },
  { name: 'Medisave', link: 'https://www.medisave.in/' },
  { name: 'Generic Aadhaar', link: 'https://www.genericaadhaar.com/' },
  { name: 'Zoylo', link: 'https://www.zoylo.com/' },
  { name: 'Mednear', link: 'https://www.mednear.com/' },
  { name: 'PharmEasy Plus', link: 'https://pharmeasy.in/plus' },
  { name: 'Mediwala', link: 'https://www.mediwala.com/' },
  { name: 'GoodRx India', link: 'https://www.goodrx.in/' },
  { name: 'Medbuzz', link: 'https://www.medbuzz.in/' },
  { name: 'Medavenue', link: 'https://www.medavenue.com/' },
  { name: 'Healthkart', link: 'https://www.healthkart.com/' },
  { name: 'Docprime Pharmacy', link: 'https://www.docprime.com/' },
  { name: 'Medworld', link: 'https://www.medworld.co.in/' },
  { name: 'SastaSundar', link: 'https://www.sastasundar.com/' },
  { name: 'Meddo', link: 'https://www.meddo.in/' },
  { name: 'Pharmacybazar', link: 'https://www.pharmacybazar.com/' },
  { name: 'Medgreen', link: 'https://www.medgreen.in/' },
  { name: 'BigChemist', link: 'https://www.bigchemist.com/' },
  { name: 'Medimart', link: 'https://www.medimart.in/' }
];

// Comprehensive Healthy tips

// Comprehensive Healthy tips for 150+ symptoms

const healthyTips = {
  
  Headache: [
    'Stay hydrated by drinking 8-10 glasses of water daily',
    'Practice stress management techniques like deep breathing or meditation',
    'Limit screen time and take breaks every 20-30 minutes',
    'Maintain a regular sleep schedule with 7-8 hours of sleep',
    'Avoid known triggers like certain foods, alcohol, or strong smells',
    'Try applying a cold or warm compress to your forehead or neck',
    'Ensure proper posture, especially when working at a desk',
    'Consider keeping a headache diary to identify patterns and triggers'
  ],
  Fever: [
    'Rest adequately to allow your body to recover',
    'Wear lightweight clothing and use light blankets',
    'Stay hydrated with water, clear broth, or electrolyte solutions',
    'Take a lukewarm bath to help reduce body temperature',
    'Avoid sudden temperature changes that can cause chills',
    'Monitor your temperature regularly and record readings',
    'Eat light, easily digestible foods when you have an appetite',
    'Seek medical attention if fever persists for more than 3 days or exceeds 103°F (39.4°C)'
  ],
  Cough: [
    'Drink warm fluids like herbal tea with honey and lemon',
    'Use a humidifier to add moisture to the air',
    'Avoid irritants like smoke, dust, and strong fragrances',
    'Keep your head elevated while sleeping to reduce nighttime coughing',
    'Stay hydrated to thin mucus secretions',
    'Try honey (for adults and children over 1 year) to soothe throat irritation',
    'Use cough drops or lozenges to reduce cough reflex',
    'Gargle with salt water to reduce throat inflammation'
  ],
  'Sore Throat': [
    'Gargle with warm salt water several times daily',
    'Stay hydrated with warm, non-acidic beverages',
    'Use throat lozenges with soothing ingredients like honey or menthol',
    'Avoid spicy, acidic, or rough foods that can irritate the throat',
    'Use a humidifier to keep air moist',
    'Rest your voice when possible',
    'Try drinking chamomile or licorice root tea',
    'Avoid smoking and secondhand smoke'
  ],
  Fatigue: [
    'Maintain a balanced diet rich in fruits, vegetables, and lean proteins',
    'Exercise regularly with moderate activities like walking or swimming',
    'Ensure 7-8 hours of quality sleep each night',
    'Stay hydrated throughout the day',
    'Manage stress through mindfulness, yoga, or other relaxation techniques',
    'Take short breaks during the day to rest and recharge',
    'Limit caffeine and alcohol consumption',
    'Consider checking your iron and vitamin B12 levels'
  ],
  'Chest Pain': [
    'For non-emergency pain, practice relaxation techniques like deep breathing',
    'Maintain good posture to reduce muscular chest pain',
    'Avoid heavy meals that can trigger acid reflux-related chest pain',
    'Stay physically active with doctor-approved exercises',
    'Limit caffeine and alcohol which can trigger heart palpitations',
    'Keep a pain diary noting triggers, duration, and severity',
    'Maintain a healthy weight to reduce strain on the heart',
    'Know the warning signs that require immediate medical attention'
  ],
  'Abdominal Pain': [
    'Eat smaller, more frequent meals throughout the day',
    'Avoid known trigger foods that cause digestive discomfort',
    'Stay hydrated but drink water slowly throughout the day',
    'Apply a heating pad on low setting to relieve cramping',
    'Practice mindful eating and proper chewing of food',
    'Try gentle, regular exercise like walking after meals',
    'Limit alcohol, caffeine, and spicy foods',
    'Keep a food diary to identify patterns and triggers'
  ],
  Dizziness: [
    'Change positions slowly, especially when getting up from lying down',
    'Stay well-hydrated throughout the day',
    'Avoid triggers like excessive caffeine or alcohol',
    'Eat regular, balanced meals to maintain blood sugar levels',
    'Practice balance exercises as recommended by healthcare providers',
    'Ensure adequate rest and regular sleep patterns',
    'Avoid driving or operating machinery when feeling dizzy',
    'Create a safe home environment to prevent falls'
  ],
  Chills: [
    'Dress in layers that can be easily added or removed',
    'Use warm blankets and keep your living space at a comfortable temperature',
    'Drink warm fluids like herbal tea or clear broth',
    'Take a warm (not hot) bath or shower',
    'Use a heating pad or hot water bottle',
    'Rest and conserve energy while your body fights infection',
    'Monitor for accompanying fever and other symptoms',
    'Ensure adequate nutrition to support your immune system'
  ],
  'Joint Pain': [
    'Maintain a healthy weight to reduce pressure on joints',
    'Engage in low-impact exercises like swimming or cycling',
    'Apply warm compresses for stiff joints and cold packs for swollen joints',
    'Include anti-inflammatory foods in your diet like fatty fish and turmeric',
    'Practice proper body mechanics during daily activities',
    'Try gentle stretching and range-of-motion exercises',
    'Consider supplements like glucosamine after consulting with a doctor',
    'Use assistive devices when needed to reduce joint strain'
  ],
  'Muscle Pain': [
    'Alternate between heat and cold therapy for affected muscles',
    'Stay hydrated to prevent muscle cramps',
    'Include potassium and magnesium-rich foods in your diet',
    'Engage in regular, gentle stretching',
    'Practice proper form during exercise and daily activities',
    'Take warm baths with Epsom salts',
    'Consider massage therapy or self-massage techniques',
    'Ensure adequate rest between workout sessions'
  ],
  Rash: [
    'Avoid scratching the affected area to prevent infection',
    'Keep the skin clean with mild, fragrance-free soap',
    'Apply cool, wet compresses for relief from itching',
    'Wear loose-fitting, cotton clothing',
    'Identify and avoid potential allergens or irritants',
    'Use gentle, hypoallergenic laundry detergents',
    'Keep the skin moisturized with fragrance-free lotions',
    'Document the appearance and spread of the rash for medical consultation'
  ],
  Itching: [
    'Apply cool, wet compresses to itchy areas',
    'Use fragrance-free moisturizers to prevent dry skin',
    'Take short, lukewarm showers instead of hot baths',
    'Wear loose-fitting, cotton clothing',
    'Keep fingernails short to prevent damage from scratching',
    'Use mild, unscented laundry detergents',
    'Consider using an air purifier to reduce airborne allergens',
    'Stay hydrated to maintain skin health'
  ],
  'Shortness of Breath': [
    'Practice deep breathing exercises focusing on exhaling completely',
    'Maintain an upright position, especially when feeling breathless',
    'Avoid exposure to air pollution, smoke, and strong scents',
    'Use a fan to circulate air around your face',
    'Practice pursed-lip breathing during episodes',
    'Engage in regular, moderate exercise as tolerated',
    'Maintain a healthy weight to reduce strain on lungs',
    'Follow an action plan developed with your healthcare provider'
  ],
  Palpitations: [
    'Reduce or eliminate caffeine intake',
    'Practice relaxation techniques like deep breathing and meditation',
    'Maintain regular meal times to avoid low blood sugar',
    'Stay well-hydrated throughout the day',
    'Avoid excessive alcohol consumption',
    'Establish a regular sleep schedule',
    'Track palpitations and potential triggers in a journal',
    'Limit stimulants and certain medications (after consulting with a doctor)'
  ],
  Diarrhea: [
    'Stay hydrated with water, clear broths, and electrolyte solutions',
    'Avoid dairy, fatty, or spicy foods during episodes',
    'Eat small, frequent meals of bland, easily digestible foods',
    'Try the BRAT diet (bananas, rice, applesauce, toast)',
    'Avoid caffeine, alcohol, and artificial sweeteners',
    'Practice good hand hygiene to prevent spread of infection',
    'Gradually reintroduce normal foods as symptoms improve',
    'Consider probiotics to restore gut flora (consult with a doctor)'
  ],
  Constipation: [
    'Increase fiber intake gradually through fruits, vegetables, and whole grains',
    'Drink plenty of water (at least 8 glasses daily)',
    'Establish a regular toilet routine, ideally after meals',
    'Engage in regular physical activity',
    'Avoid holding in bowel movements when you feel the urge',
    'Consider using a footstool when using the toilet',
    'Limit foods that can worsen constipation like processed foods',
    'Massage your abdomen in a clockwise direction'
  ],
  Vomiting: [
    'Rest your stomach by avoiding food for a few hours after vomiting',
    'Sip small amounts of clear fluids to prevent dehydration',
    'Gradually introduce bland foods like crackers or toast',
    'Avoid strong odors that may trigger nausea',
    'Try ginger tea or ginger candies for natural relief',
    'Eat small amounts frequently rather than large meals',
    'Avoid lying flat right after eating',
    'Keep track of frequency and any accompanying symptoms'
  ],
  'Loss of Appetite': [
    'Eat smaller, more frequent meals throughout the day',
    'Make meals visually appealing and vary food colors and textures',
    'Try eating in a pleasant environment free from distractions',
    'Choose nutrient-dense foods to maximize nutritional intake',
    'Schedule meals at consistent times each day',
    'Stay hydrated between meals rather than with meals',
    'Include light physical activity before meals if possible',
    'Consider liquid nutrition supplements if needed'
  ],
  'Weight Loss': [
    'Consult with a healthcare provider before starting any weight loss program',
    'Focus on nutrient-dense, whole foods rather than processed options',
    'Create a modest calorie deficit through diet and increased activity',
    'Stay adequately hydrated throughout the day',
    'Include regular physical activity focusing on both cardio and strength training',
    'Monitor progress with measurements beyond just weight (like energy levels)',
    'Eat mindfully and avoid distractions during meals',
    'Ensure adequate protein intake to preserve muscle mass'
  ],
  'Weight Gain': [
    'Focus on nutrient-dense foods rather than empty calories',
    'Include healthy fats like avocados, nuts, and olive oil',
    'Eat protein-rich foods with each meal',
    'Add extra calories through healthy smoothies or shakes',
    'Incorporate strength training to build muscle mass',
    'Eat more frequently with 3 main meals and 2-3 substantial snacks',
    'Track your food intake to ensure a calorie surplus',
    'Ensure adequate sleep for optimal hormone balance'
  ],
  'Night Sweats': [
    'Use moisture-wicking bedding and sleepwear',
    'Keep your bedroom cool (between 60-67°F or 15-19°C)',
    'Avoid spicy foods, caffeine, and alcohol before bedtime',
    'Stay hydrated during the day but limit fluids close to bedtime',
    'Take a cool shower before bed',
    'Practice relaxation techniques to reduce stress',
    'Keep a small towel and change of clothes nearby',
    'Maintain a sleep diary to identify patterns and triggers'
  ],
  'Swollen Lymph Nodes': [
    'Apply warm compresses to the swollen area',
    'Get plenty of rest to support immune function',
    'Stay well-hydrated to help flush toxins',
    'Avoid alcohol and tobacco products',
    'Take over-the-counter pain relievers as directed if uncomfortable',
    'Monitor for accompanying symptoms like fever or unexplained weight loss',
    'Avoid putting pressure on the swollen area',
    'Follow a balanced diet rich in immune-supporting nutrients'
  ],
  Sleeplessness: [
    'Maintain a consistent sleep schedule, even on weekends',
    'Create a relaxing bedtime routine',
    'Make your bedroom dark, quiet, and cool',
    'Limit screen time at least one hour before bed',
    'Avoid caffeine, alcohol, and large meals near bedtime',
    'Exercise regularly, but not too close to bedtime',
    'Use your bed only for sleep and intimacy',
    'Practice relaxation techniques like deep breathing or meditation'
  ],
  'Excessive Sleepiness': [
    'Maintain a consistent sleep schedule with adequate duration',
    'Expose yourself to bright light, especially in the morning',
    'Exercise regularly, preferably earlier in the day',
    'Limit caffeine to morning hours only',
    'Take short, strategic power naps (20-30 minutes) when needed',
    'Evaluate medications that might cause drowsiness',
    'Check for sleep disorders like sleep apnea',
    'Keep your bedroom free from distractions like electronics'
  ],
  'Blur of Vision': [
    'Take regular breaks when using digital screens (20-20-20 rule)',
    'Ensure proper lighting for reading and detail work',
    'Keep eyeglasses and contact lens prescriptions up-to-date',
    'Use artificial tears for dry eyes',
    'Wear sunglasses to protect from UV exposure',
    'Eat a diet rich in eye-healthy nutrients like lutein and zeaxanthin',
    'Maintain a healthy blood pressure and blood sugar',
    'Have regular comprehensive eye exams'
  ],
  'Eye Pain': [
    'Rest your eyes from screen time and close-up work',
    'Apply warm compresses for eye strain or dry eyes',
    'Use cool compresses for allergy-related discomfort',
    'Ensure proper lighting for visual tasks',
    'Stay well-hydrated to prevent dry eyes',
    'Avoid rubbing your eyes',
    'Use lubricating eye drops as recommended',
    'Wear appropriate eye protection during activities'
  ],
  'Hearing Loss': [
    'Protect ears from loud noises with appropriate hearing protection',
    'Keep the volume moderate when using headphones',
    'Limit use of cotton swabs which can impact earwax',
    'Keep ears dry to prevent infections',
    'Follow the 60/60 rule: no more than 60% volume for no more than 60 minutes',
    'Consider assistive listening devices if needed',
    'Have regular hearing assessments, especially if at risk',
    'Maintain healthy blood pressure and blood sugar'
  ],
  Earache: [
    'Apply a warm compress to the affected ear',
    'Stay upright to help fluid drainage',
    'Take over-the-counter pain relievers as directed',
    'Keep the ear dry during bathing or swimming',
    'Avoid inserting anything into the ear canal',
    'Try chewing gum to relieve pressure (for airplane ear)',
    'Use ear drops only as prescribed by a healthcare provider',
    'Practice stress reduction techniques for TMJ-related ear pain'
  ],
  Tinnitus: [
    'Use sound masking with white noise or nature sounds',
    'Limit exposure to loud noises',
    'Reduce consumption of caffeine, alcohol, and nicotine',
    'Practice relaxation techniques to manage stress',
    'Maintain consistent physical activity',
    'Protect your hearing in noisy environments',
    'Limit salt intake to reduce pressure in the ear',
    'Try sound therapy or cognitive behavioral therapy techniques'
  ],
  Nosebleed: [
    'Sit upright and lean slightly forward',
    'Pinch the soft part of your nose for 10-15 minutes',
    'Use a cold compress or ice pack on the bridge of your nose',
    'Breathe through your mouth during the episode',
    'Keep the inside of your nose moist with saline spray',
    'Use a humidifier to prevent dry nasal passages',
    'Avoid picking or blowing your nose forcefully',
    'Apply petroleum jelly inside nostrils for dryness'
  ],
  'Runny Nose': [
    'Stay hydrated to thin mucus secretions',
    'Use saline nasal sprays to flush irritants',
    'Apply warm compresses across the nose and sinuses',
    'Inhale steam from a shower or bowl of hot water',
    'Elevate your head while sleeping',
    'Use a humidifier in dry environments',
    'Avoid known allergens and irritants',
    'Try spicy foods temporarily to promote drainage'
  ],
  Sneezing: [
    'Identify and avoid allergen triggers',
    'Use HEPA air purifiers in your home',
    'Keep windows closed during high pollen seasons',
    'Change clothes after being outdoors during allergy season',
    'Regularly clean bedding in hot water',
    'Use dust-mite proof covers for pillows and mattresses',
    'Try nasal irrigation with saline solution',
    'Consider wearing a mask in triggering environments'
  ],
  'Swollen Ankles': [
    'Elevate your legs above heart level several times daily',
    'Reduce salt intake to minimize fluid retention',
    'Stay physically active with low-impact exercises',
    'Wear compression stockings if recommended',
    'Avoid sitting or standing for prolonged periods',
    'Maintain a healthy weight to reduce pressure on ankles',
    'Perform ankle pumping exercises regularly',
    'Stay well-hydrated to help flush excess fluid'
  ],
  'Back Pain': [
    'Maintain proper posture, especially when sitting for long periods',
    'Use ergonomic furniture and proper lifting techniques',
    'Strengthen core muscles through appropriate exercises',
    'Apply hot or cold packs to the painful area',
    'Stay active with low-impact activities like walking or swimming',
    'Stretch gently before and after physical activity',
    'Maintain a healthy weight to reduce strain on your back',
    'Consider sleeping position and mattress quality'
  ],
  'Neck Pain': [
    'Maintain proper posture, especially during screen time',
    'Take frequent breaks from computer and phone use',
    'Use a supportive pillow that maintains proper neck alignment',
    'Apply hot or cold therapy as needed',
    'Perform gentle neck stretches and range of motion exercises',
    'Adjust workstation for ergonomic positioning',
    'Reduce stress with relaxation techniques',
    'Avoid carrying heavy bags on one shoulder'
  ],
  'Shoulder Pain': [
    'Apply ice for acute pain or heat for chronic stiffness',
    'Perform gentle range-of-motion exercises',
    'Maintain good posture throughout the day',
    'Modify activities that aggravate the pain',
    'Use proper form during exercise and daily activities',
    'Strengthen the rotator cuff muscles with appropriate exercises',
    'Sleep in positions that do nnt put pressure on the shoulder',
    'Take breaks during repetitive activities'
  ],
  'Knee Pain': [
    'Maintain a healthy weight to reduce pressure on knee joints',
    'Wear supportive footwear with good arch support',
    'Apply ice to reduce inflammation after activity',
    'Warm up properly before exercise',
    'Strengthen muscles around the knee, especially quadriceps',
    'Choose low-impact activities like swimming or cycling',
    'Use proper technique during squats and lunges',
    'Consider using a knee brace during activities if recommended'
  ],
  'Dry Mouth': [
    'Sip water frequently throughout the day',
    'Use sugar-free gum or lozenges to stimulate saliva',
    'Breathe through your nose rather than your mouth',
    'Use a humidifier, especially at night',
    'Avoid caffeine, alcohol, and tobacco products',
    'Limit salt and sugar in your diet',
    'Try alcohol-free mouthwash designed for dry mouth',
    'Practice good oral hygiene to prevent dental problems'
  ],
  
'Flatulence': [
    'Identify and avoid gas-producing foods',
    'Eat smaller meals more slowly',
    'Avoid carbonated beverages and drinking through straws',
    'Limit high-fat foods which slow digestion',
    'Try enzyme supplements before meals if recommended',
    'Gradually increase fiber intake to allow gut adjustment',
    'Stay physically active to promote gut motility',
    'Try probiotics to improve gut flora balance'
  ],
  'Incontinence': [
    'Practice pelvic floor (Kegel) exercises regularly',
    'Schedule regular bathroom trips rather than waiting',
    'Avoid bladder irritants like caffeine and alcohol',
    'Maintain a healthy weight to reduce pressure on bladder',
    'Stay hydrated but limit fluids before bedtime',
    'Quit smoking which can cause coughing and bladder pressure',
    'Treat constipation which can worsen urinary symptoms',
    'Keep a symptom diary to identify triggers'
  ],
  'Low Back Pain': [
    'Maintain proper posture when sitting and standing',
    'Use proper lifting technique (bend knees, not waist)',
    'Strengthen core muscles with appropriate exercises',
    'Maintain a healthy weight to reduce strain',
    'Choose a supportive mattress and sleeping position',
    'Stay active with low-impact exercises like walking or swimming',
    'Apply heat for chronic pain or ice for acute injury',
    'Take regular breaks from prolonged sitting'
  ],
  'Swollen Glands': [
    'Get adequate rest to support immune function',
    'Apply warm compresses to the swollen area',
    'Stay well-hydrated to help flush the system',
    'Practice good hygiene to prevent infections',
    'Eat immune-supporting foods rich in vitamins C and D',
    'Avoid alcohol and tobacco products',
    'Gargle with salt water for throat-related swelling',
    'Monitor temperature for accompanying fever'
  ],
  'Skin Ulcers': [
    'Keep the area clean with gentle washing',
    'Apply dressings as recommended by healthcare provider',
    'Change positions frequently to relieve pressure',
    'Maintain adequate nutrition with protein and vitamin C',
    'Stay well-hydrated to support tissue healing',
    'Inspect the skin daily for new ulcers or changes',
    'Use pressure-relieving mattresses or cushions',
    'Manage conditions like diabetes that affect healing'
  ],
  'Genital Sores': [
    'Keep the area clean with mild soap and water',
    'Wear loose-fitting cotton underwear',
    'Avoid sexual activity until sores are healed',
    'Apply cold compresses to relieve pain and itching',
    'Take sitz baths with warm water',
    'Keep the area dry after washing',
    'Use separate towels and washcloths',
    'Take all medications as prescribed for full duration'
  ],
  'Excessive Gas': [
    'Eat smaller, more frequent meals',
    'Identify and limit gas-producing foods',
    'Chew food thoroughly and eat slowly',
    'Avoid chewing gum and carbonated drinks',
    'Try over-the-counter enzyme supplements before meals',
    'Limit lactose if intolerant',
    'Exercise regularly to promote gut motility',
    'Try probiotics to improve gut flora'
  ],
  'Indigestion': [
    'Eat smaller, more frequent meals',
    'Avoid lying down within 2-3 hours after eating',
    'Identify and avoid trigger foods and beverages',
    'Maintain a healthy weight',
    'Wear loose-fitting clothing around the waist',
    'Manage stress which can trigger symptoms',
    'Limit alcohol and tobacco use',
    'Chew food thoroughly and eat slowly'
  ],
  'Reduced Appetite': [
    'Eat smaller, more frequent meals throughout the day',
    'Focus on nutrient-dense foods when you do eat',
    'Make meals visually appealing and flavorful',
    'Stay physically active to stimulate hunger',
    'Eat in a pleasant environment without distractions',
    'Try liquid nutrition when solid foods are not appealing',
    'Schedule meals at consistent times',
    'Address any underlying anxiety or depression'
  ],
  'Difficulty Breathing': [
    'Identify and avoid triggers like allergens or irritants',
    'Use the pursed-lip breathing technique during episodes',
    'Maintain an upright position to ease breathing',
    'Keep rescue medications readily available',
    'Control environment humidity and temperature',
    'Practice breathing exercises to strengthen respiratory muscles',
    'Follow an action plan developed with your healthcare provider',
    'Maintain a healthy weight to reduce strain on lungs'
  ],
  'Shortness of Breath at Night': [
    'Sleep with head and upper body elevated',
    'Use additional pillows or a wedge pillow',
    'Avoid eating large meals within 3 hours of bedtime',
    'Create a calm sleep environment',
    'Use a humidifier if dry air is a trigger',
    'Keep rescue medications at bedside',
    'Avoid sleeping on your back',
    'Control allergens in the bedroom'
  ],
  'Dizziness When Standing': [
    'Change positions slowly, especially from lying to standing',
    'Stay well-hydrated throughout the day',
    'Avoid alcohol and limit caffeine',
    'Consume adequate salt unless restricted',
    'Wear compression stockings if recommended',
    'Exercise regularly as tolerated',
    'Sleep with the head of the bed slightly elevated',
    'Counter-maneuvers like crossing legs or tensing muscles before standing'
  ],
  'Leg Pain': [
    'Elevate legs when resting',
    'Stay physically active with low-impact exercises',
    'Wear supportive, comfortable footwear',
    'Apply heat for muscle pain or ice for inflammation',
    'Stretch leg muscles regularly',
    'Maintain a healthy weight to reduce strain',
    'Avoid prolonged sitting or standing',
    'Consider compression stockings for circulation issues'
  ],
  'Mood Swings': [
    'Establish regular daily routines',
    'Ensure adequate sleep and consistent sleep patterns',
    'Engage in regular physical activity',
    'Practice stress management techniques',
    'Maintain a balanced diet with regular meals',
    'Limit caffeine, alcohol, and sugar',
    'Track moods to identify patterns and triggers',
    'Nurture social connections and support systems'
  ],
  'Panic Attacks': [
    'Practice deep breathing techniques during attacks',
    'Use grounding techniques (name 5 things you can see, 4 things you can touch, etc.)',
    'Recognize that symptoms will pass and are not dangerous',
    'Avoid caffeine, alcohol, and nicotine',
    'Maintain regular physical activity',
    'Practice regular relaxation techniques',
    'Ensure adequate sleep and regular sleep patterns',
    'Identify and address attack triggers'
  ],
  'Obsessive Thoughts': [
    'Practice mindfulness to observe thoughts without judgment',
    'Use scheduled "worry time" to contain anxious thoughts',
    'Challenge unhelpful thoughts with evidence-based thinking',
    'Engage in physical exercise to reduce mental tension',
    'Practice deep breathing when thoughts intensify',
    'Use distraction techniques when thoughts begin',
    'Maintain social connections and talk about your experiences',
    'Ensure adequate sleep and regular sleep patterns'
  ],
  'Racing Thoughts': [
    'Practice meditation or mindfulness techniques',
    'Write thoughts down to externalize them',
    'Engage in regular physical activity',
    'Establish a regular sleep schedule',
    'Limit stimulants like caffeine',
    'Try progressive muscle relaxation before bed',
    'Use "thought stopping" techniques like visualizing a stop sign',
    'Create a bedtime routine to wind down mentally'
  ],
  'Excessive Worry': [
    'Limit exposure to news and media that increase anxiety',
    'Practice scheduled "worry time" to contain anxious thoughts',
    'Challenge catastrophic thinking with realistic probabilities',
    'Practice deep breathing and progressive relaxation',
    'Stay physically active to reduce tension',
    'Maintain social connections and share concerns',
    'Focus on what you can control',
    'Use a worry journal to track and evaluate concerns'
  ],
  'Hallucinations': [
    'Create a structured daily routine',
    'Ensure adequate sleep and regular sleep patterns',
    'Maintain a calm, low-stimulation environment',
    'Avoid alcohol and recreational drugs',
    'Take medications exactly as prescribed',
    'Use reality testing techniques with trusted people',
    'Keep a symptom journal to identify triggers',
    'Engage with supportive family members or friends'
  ],
  'Blood Pressure Changes': [
    'Monitor blood pressure regularly and keep a log',
    'Maintain a consistent low-sodium diet',
    'Engage in regular physical activity',
    'Limit alcohol consumption',
    'Achieve and maintain a healthy weight',
    'Practice stress management techniques',
    'Take medications at the same time each day',
    'Limit caffeine intake'
  ],
  'Abnormal Heart Rhythm': [
    'Avoid stimulants like caffeine and nicotine',
    'Limit alcohol consumption',
    'Maintain a heart-healthy diet low in saturated fats',
    'Practice stress reduction techniques',
    'Take medications exactly as prescribed',
    'Monitor pulse rate and rhythm regularly',
    'Get adequate sleep and maintain a regular sleep schedule',
    'Stay well-hydrated unless fluid restricted'
  ],
  'Varicose Veins': [
    'Avoid standing or sitting for long periods',
    'Elevate legs when resting',
    'Exercise regularly with focus on walking or swimming',
    'Wear compression stockings as recommended',
    'Maintain a healthy weight',
    'Avoid crossing legs when sitting',
    'Wear loose-fitting clothing',
    'Choose low-heeled shoes over high heels'
  ],
  'Leg Swelling': [
    'Elevate legs above heart level when resting',
    'Avoid sitting or standing for prolonged periods',
    'Exercise regularly to improve circulation',
    'Wear compression stockings if recommended',
    'Reduce salt intake to minimize fluid retention',
    'Stay hydrated but monitor fluid intake if restricted',
    'Avoid crossing legs when sitting',
    'Maintain a healthy weight'
  ],
  'Intolerance to Cold': [
    'Dress in layers that can be adjusted as needed',
    'Keep extremities covered with gloves, socks, and hats',
    'Maintain adequate indoor heating',
    'Use heating pads or electric blankets safely',
    'Consume warm foods and beverages',
    'Stay physically active to generate body heat',
    'Consider checking thyroid function',
    'Maintain adequate iron intake'
  ],
  'Intolerance to Heat': [
    'Stay in air-conditioned environments during hot weather',
    'Use fans to circulate air',
    'Wear lightweight, loose-fitting, light-colored clothing',
    'Stay well-hydrated with cool water',
    'Take cool showers or baths',
    'Limit outdoor activities during peak heat hours',
    'Apply cool compresses to pulse points',
    'Use cooling products like gel packs or cooling towels'
  ],
  'Unintended Weight Change': [
    'Keep a food diary to track intake',
    'Eat regular meals and avoid skipping',
    'Have regular check-ups to monitor health',
    'Track weight changes systematically',
    'Ensure adequate protein intake',
    'Adjust calorie intake according to activity level',
    'Address any difficulty swallowing or chewing',
    'Check medications for possible side effects'
  ],
  'Excessive Hunger': [
    'Eat regular, balanced meals with adequate protein',
    'Include high-fiber foods that promote satiety',
    'Stay well-hydrated throughout the day',
    'Choose complex carbohydrates over simple sugars',
    'Monitor blood sugar if diabetic',
    'Get adequate sleep to regulate hunger hormones',
    'Manage stress which can trigger emotional eating',
    'Track hunger patterns to identify triggers'
  ],
  'Acid Reflux': [
    'Avoid lying down for 2-3 hours after eating',
    'Elevate the head of your bed 6-8 inches',
    'Eat smaller, more frequent meals',
    'Identify and avoid trigger foods and beverages',
    'Maintain a healthy weight',
    'Wear loose-fitting clothing',
    'Limit alcohol and quit smoking',
    'Chew food thoroughly and eat slowly'
  ],
  'Stomach Cramps': [
    'Apply a heating pad to the abdomen',
    'Take a warm bath to relax abdominal muscles',
    'Practice deep breathing during episodes',
    'Drink clear fluids to prevent dehydration',
    'Avoid gas-producing foods',
    'Eat smaller, more frequent meals',
    'Try peppermint tea for non-ulcer cramps',
    'Keep a food diary to identify potential triggers'
  ],
  'Rectal Bleeding': [
    'Increase dietary fiber gradually',
    'Stay well-hydrated to soften stool',
    'Avoid straining during bowel movements',
    'Practice good anal hygiene',
    'Take warm sitz baths for hemorrhoid-related bleeding',
    'Avoid alcohol and spicy foods',
    'Exercise regularly for bowel health',
    'Use soft, unscented toilet paper or wet wipes'
  ],
  'Black Stool': [
    'Monitor and document stool appearance',
    'Check medications that may affect stool color',
    'Stay hydrated to support digestive health',
    'Avoid self-medicating with iron supplements',
    'Follow a bland diet during episodes',
    'Avoid alcohol which can irritate the digestive tract',
    'Maintain regular physical activity',
    'Seek immediate medical attention if accompanied by pain'
  ],
  'Pale Stool': [
    'Stay well-hydrated to support liver function',
    'Follow a balanced diet that is gentle on digestion',
    'Limit fat intake if stools are very light-colored',
    'Avoid alcohol which stresses the liver',
    'Include yellow and orange vegetables for natural coloring',
    'Monitor and document stool changes',
    'Maintain regular physical activity',
    'Support liver health with antioxidant-rich foods'
  ],
  'Greasy Stool': [
    'Reduce dietary fat intake',
    'Eat smaller, more frequent meals',
    'Stay hydrated to support digestion',
    'Take digestive enzymes if recommended',
    'Avoid alcohol and spicy foods',
    'Monitor and document stool changes',
    'Follow a high-fiber diet unless contraindicated',
    'Identify and avoid foods that worsen symptoms'
  ],
  'Bloody Mucus in Stool': [
    'Stay well-hydrated to prevent constipation',
    'Follow a bland diet during episodes',
    'Avoid alcohol, caffeine, and spicy foods',
    'Avoid straining during bowel movements',
    'Document frequency, amount, and appearance',
    'Take sitz baths for anal irritation',
    'Avoid anti-inflammatory medications unless prescribed',
    'Seek immediate medical attention if severe or persistent'
  ],
  'Urinary Urgency': [
    'Practice timed voiding (urinating on a schedule)',
    'Perform pelvic floor exercises regularly',
    'Avoid bladder irritants like caffeine and alcohol',
    'Stay hydrated but reduce fluids before bedtime',
    'Maintain a healthy weight to reduce bladder pressure',
    'Wear cotton underwear and loose-fitting clothes',
    'Practice double voiding (urinate, wait, try again)',
    'Keep a diary of symptoms and potential triggers'
  ],
  'Urinary Frequency': [
    'Limit fluids before bedtime but stay hydrated during the day',
    'Avoid bladder irritants like caffeine, alcohol, and spicy foods',
    'Practice pelvic floor exercises',
    'Maintain a healthy weight',
    'Wear cotton underwear and loose-fitting clothing',
    'Schedule bathroom trips rather than waiting until urgent',
    'Practice "double voiding" technique',
    'Keep a bladder diary to identify patterns'
  ],
  'Urinary Hesitancy': [
    'Relax and take your time when urinating',
    'Run water or place hands in warm water to trigger urination',
    'Ensure privacy and comfort',
    'Lean forward slightly when seated or stand comfortably',
    'Practice double voiding (try again after initial stream)',
    'Stay well-hydrated throughout the day',
    'Perform relaxation exercises if anxiety is a factor',
    'Review medications that might affect urination'
  ],
  'Decreased Urine Output': [
    'Increase fluid intake unless otherwise advised',
    'Monitor and record daily fluid intake and urine output',
    'Limit alcohol and caffeine which can increase fluid loss',
    'Stay cool in hot weather to reduce sweat loss',
    'Monitor blood pressure regularly',
    'Weigh daily to track fluid retention',
    'Reduce sodium intake to prevent fluid retention',
    'Monitor for other symptoms like swelling or shortness of breath'
  ],
  'Dark Urine': [
    'Increase water intake to lighten urine color',
    'Avoid dehydration, especially during exercise or illness',
    'Limit alcohol consumption',
    'Be aware of foods that can darken urine (beets, blackberries)',
    'Check medications that might affect urine color',
    'Protect liver health by limiting fatty foods and alcohol',
    'Maintain regular physical activity',
    'Monitor and document urine color changes'
  ],
  'Cloudy Urine': [
    'Increase water intake throughout the day',
    'Practice good hygiene to prevent infections',
    'Urinate after sexual activity',
    'Wear cotton underwear and loose-fitting clothing',
    'Avoid holding urine for long periods',
    'Maintain a balanced diet low in excess minerals',
    'Limit phosphate-rich foods if kidney stones are an issue',
    'Document urine appearance and accompanying symptoms'
  ],
  'Foamy Urine': [
    'Maintain proper hydration throughout the day',
    'Follow a heart-healthy diet low in sodium',
    'Maintain a healthy blood pressure',
    'Limit protein intake if recommended by a doctor',
    'Monitor blood glucose if diabetic',
    'Maintain a healthy weight',
    'Document urine changes and accompanying symptoms',
    'Follow a regular exercise routine as tolerated'
  ],
  'Foul-Smelling Urine': [
    'Increase water intake to dilute urine',
    'Practice good personal hygiene',
    'Urinate after sexual activity',
    'Avoid foods that can affect urine odor (asparagus, garlic)',
    'Wear cotton underwear and loose-fitting clothing',
    'Avoid holding urine for long periods',
    'Monitor blood glucose if diabetic',
    'Document changes and accompanying symptoms'
  ],
  'Bedwetting': [
    'Limit fluids before bedtime (2-3 hours prior)',
    'Empty bladder completely before bed',
    'Avoid caffeine and carbonated drinks',
    'Use a bedwetting alarm if appropriate',
    'Establish a consistent bedtime routine',
    'Use waterproof mattress covers for comfort',
    'Maintain a positive, supportive environment',
    'Practice bladder training exercises during the day'
  ],
  'Double Vision': [
    'Cover one eye with a patch when symptoms occur',
    'Avoid driving or operating machinery during episodes',
    'Ensure adequate lighting for activities',
    'Rest eyes frequently during screen time',
    'Document frequency, duration, and circumstances',
    'Maintain a consistent sleep schedule',
    'Limit alcohol consumption',
    'Keep eyeglasses prescription current'
  ],
  'Night Blindness': [
    'Ensure adequate vitamin A in your diet',
    'Use night lights throughout your home',
    'Allow extra time for eyes to adjust to darkness',
    'Consider driving alternatives at night',
    'Keep a flashlight readily available',
    'Get regular eye examinations',
    'Wear glasses with anti-reflective coating',
    'Install motion-sensor lights in darker areas'
  ],
  'Sensitivity to Light': [
    'Wear sunglasses outdoors, even on cloudy days',
    'Use wide-brimmed hats for additional protection',
    'Adjust screen brightness and use anti-glare filters',
    'Install dimmer switches in your home',
    'Use FL-41 tinted glasses for indoor light sensitivity',
    'Gradually adapt to changes in lighting',
    'Consider polarized lenses for driving',
    'Take breaks during screen time'
  ],
  'Floaters in Vision': [
    'Follow a healthy diet rich in antioxidants',
    'Wear sunglasses to protect eyes from UV rays',
    'Stay well-hydrated to maintain eye health',
    'Avoid eye strain from prolonged screen time',
    'Rest eyes regularly during detailed visual tasks',
    'Maintain healthy blood pressure and blood sugar',
    'Use eye drops for dryness if recommended',
    'Document any sudden increases or changes in floaters'
  ],
  'Flashes of Light': [
    'Rest your eyes when flashes occur',
    'Avoid sudden movements during episodes',
    'Document frequency, pattern, and accompanying symptoms',
    'Ensure adequate lighting to reduce eye strain',
    'Stay hydrated for optimal eye health',
    'Maintain a healthy blood pressure',
    'Wear sunglasses to protect from UV exposure',
    'Avoid alcohol and tobacco which affect circulation'
  ],
  'Dry Eyes': [
    'Use preservative-free artificial tears as needed',
    'Take regular breaks during screen time (20-20-20 rule)',
    'Use a humidifier to add moisture to indoor air',
    'Wear wraparound sunglasses outdoors to prevent evaporation',
    'Position computer screens below eye level to reduce exposure',
    'Stay well-hydrated throughout the day',
    'Include omega-3 fatty acids in your diet',
    'Avoid direct air flow from fans or heating vents'
  ],
  'Eye Strain': [
    'Follow the 20-20-20 rule (every 20 minutes, look 20 feet away for 20 seconds)',
    'Ensure proper lighting for tasks (not too bright or dim)',
    'Position screens at eye level and arms length away',
    'Use appropriate glasses for specific visual tasks',
    'Adjust screen brightness and contrast for comfort',
    'Take regular breaks from close-up work',
    'Use artificial tears for dryness',
    'Consider blue light filtering glasses for digital screens'
  ],
  'Loss of Balance': [
    'Create a safe home environment by removing hazards',
    'Use assistive devices like canes or walkers if needed',
    'Perform balance exercises under proper supervision',
    'Wear appropriate footwear with non-slip soles',
    'Move slowly when changing positions',
    'Ensure adequate lighting, especially at night',
    'Review medications that might affect balance',
    'Maintain regular physical activity as tolerated'
  ],
  'Loss of Coordination': [
    'Simplify your home environment to reduce obstacles',
    'Use adaptive equipment for daily activities',
    'Perform coordination exercises recommended by therapists',
    'Focus on one task at a time without rushing',
    'Establish regular routines for daily activities',
    'Ensure adequate lighting in all areas',
    'Wear appropriate, supportive footwear',
    'Maintain regular physical activity as tolerated'
  ], 

 'Excessive Thirst': [
    'Track your fluid intake and symptoms in a journal',
    'Stay consistently hydrated throughout the day',
    'Choose water over sugary or caffeinated beverages',
    'Monitor for other symptoms like frequent urination',
    'Eat water-rich fruits and vegetables',
    'Limit alcohol consumption which can cause dehydration',
    'Balance electrolytes with appropriate foods or supplements',
    'Check medications that might cause dry mouth or increased thirst'
  ],
  'Frequent Urination': [
    'Limit fluid intake in the evening to reduce nighttime urination',
    'Avoid bladder irritants like caffeine, alcohol, and artificial sweeteners',
    'Practice timed voiding (going to the bathroom on a schedule)',
    'Strengthen pelvic floor muscles with Kegel exercises',
    'Maintain a healthy weight to reduce pressure on the bladder',
    'Keep a diary of urination patterns and potential triggers',
    'Empty your bladder completely when urinating',
    'Follow a balanced diet low in bladder irritants'
  ],
  'Painful Urination': [
    'Increase water intake to dilute urine and reduce irritation',
    'Avoid potential irritants like caffeine, alcohol, and spicy foods',
    'Take warm baths to alleviate discomfort',
    'Wear loose-fitting, cotton underwear',
    'Urinate when you feel the need rather than holding it',
    'Wipe from front to back after using the toilet',
    'Avoid using scented products in the genital area',
    'Practice good hygiene without using harsh soaps'
  ],
  'Blood in Urine': [
    'Increase fluid intake to help flush the urinary system',
    'Avoid strenuous exercise until evaluated by a healthcare provider',
    'Track color changes and accompanying symptoms',
    'Avoid potential bladder irritants like caffeine and alcohol',
    'Take all prescribed medications as directed',
    'Limit high-sodium foods to reduce water retention',
    'Follow a consistent urination schedule',
    'Seek immediate medical attention if accompanied by pain or fever'
  ],
  'Loss of Smell': [
    'Practice smell training with essential oils or spices',
    'Stay hydrated to keep nasal passages moist',
    'Use a humidifier, especially during dry weather',
    'Avoid exposure to irritants like smoke and strong chemicals',
    'Practice nasal irrigation with saline solution',
    'Include zinc-rich foods in your diet',
    'Avoid steroid nasal sprays unless prescribed',
    'Keep track of smell function changes over time'
  ],
  'Loss of Taste': [
    'Maintain good oral hygiene to reduce taste interference',
    'Stay hydrated to ensure adequate saliva production',
    'Experiment with different textures, temperatures, and spices',
    'Quit smoking, which can dull taste receptors',
    'Add herbs and spices rather than salt or sugar',
    'Rinse mouth with salt water or baking soda solution',
    'Eat mindfully, focusing on the sensory experience',
    'Include zinc-rich foods in your diet'
  ],
  'Mouth Ulcers': [
    'Avoid spicy, acidic, or rough-textured foods',
    'Use a soft-bristled toothbrush',
    'Rinse with salt water or baking soda solution',
    'Apply honey to ulcers (has antibacterial properties)',
    'Stay hydrated to prevent dry mouth',
    'Avoid toothpastes containing sodium lauryl sulfate',
    'Include vitamin-rich foods like fruits and vegetables',
    'Manage stress through relaxation techniques'
  ],
  'Bad Breath': [
    'Brush teeth twice daily and floss at least once daily',
    'Clean your tongue with a scraper or brush',
    'Stay hydrated to maintain saliva production',
    'Avoid foods with strong odors like garlic and onions',
    'Limit coffee and alcohol consumption',
    'Chew sugar-free gum to stimulate saliva flow',
    'Replace your toothbrush every 3-4 months',
    'Schedule regular dental cleanings and check-ups'
  ],
  'Gum Bleeding': [
    'Brush gently with a soft-bristled toothbrush',
    'Floss daily using proper technique',
    'Use an antimicrobial mouthwash',
    'Increase vitamin C and K intake for gum health',
    'Quit smoking to improve gum circulation',
    'Rinse with salt water to reduce inflammation',
    'Manage stress which can affect gum health',
    'Maintain regular dental check-ups and cleanings'
  ],
  'Hair Loss': [
    'Avoid tight hairstyles that pull on hair follicles',
    'Use gentle hair care products without harsh chemicals',
    'Limit heat styling and chemical treatments',
    'Eat a balanced diet rich in protein, iron, and vitamins',
    'Manage stress through relaxation techniques',
    'Be gentle when washing and brushing hair',
    'Consider supplements like biotin (after consulting a doctor)',
    'Protect hair from sun damage with hats or scarves'
  ],
  'Dry Skin': [
    'Use warm rather than hot water for bathing',
    'Apply moisturizer immediately after bathing',
    'Use fragrance-free, hypoallergenic skin products',
    'Run a humidifier in dry environments',
    'Drink plenty of water throughout the day',
    'Include omega-3 fatty acids in your diet',
    'Wear soft, breathable fabrics like cotton',
    'Limit bath/shower time to 5-10 minutes'
  ],
  'Bruising Easily': [
    'Protect vulnerable areas with padding during activities',
    'Include vitamin K-rich foods like leafy greens in your diet',
    'Ensure adequate vitamin C intake for blood vessel strength',
    'Apply cold compresses promptly after injury',
    'Avoid blood-thinning medications when possible (consult doctor)',
    'Use proper form during exercise to prevent injury',
    'Create a safe home environment to prevent bumps',
    'Elevate and support injured areas to reduce bleeding'
  ],
  'Yellowing of Skin': [
    'Stay well-hydrated to support liver function',
    'Follow a balanced diet with plenty of fruits and vegetables',
    'Limit alcohol consumption or avoid completely',
    'Avoid medications that strain the liver (consult doctor)',
    'Exercise regularly to promote healthy circulation',
    'Practice good hygiene to prevent infections',
    'Maintain a healthy weight to reduce fatty liver risk',
    'Avoid exposure to hepatitis-causing viruses'
  ],
  'Tremors': [
    'Reduce caffeine intake which can worsen tremors',
    'Avoid alcohol which can trigger or worsen shaking',
    'Get adequate sleep to reduce fatigue-related tremors',
    'Practice stress-reduction techniques like meditation',
    'Use weighted utensils or cups for eating and drinking',
    'Try adaptive equipment for daily activities',
    'Engage in exercises that improve coordination and balance',
    'Maintain a consistent schedule for medications if prescribed'
  ],
  'Seizures': [
    'Take anti-seizure medications exactly as prescribed',
    'Maintain a regular sleep schedule with adequate duration',
    'Identify and avoid personal seizure triggers',
    'Wear medical identification regarding your condition',
    'Practice stress management techniques',
    'Maintain a consistent meal schedule to avoid low blood sugar',
    'Limit alcohol intake which can interfere with medications',
    'Create a safe home environment to prevent injury during seizures'
  ],
  'Confusion': [
    'Maintain a regular daily routine',
    'Keep a calendar or planner for appointments and tasks',
    'Stay mentally active with puzzles, reading, or games',
    'Ensure adequate sleep and regular sleep patterns',
    'Stay hydrated and eat regular, nutritious meals',
    'Limit alcohol consumption',
    'Review medications with your doctor (some can cause confusion)',
    'Create a calm, organized living environment'
  ],
  'Memory Loss': [
    'Engage in regular mental stimulation like puzzles or learning',
    'Stay physically active to improve brain blood flow',
    'Maintain social connections and conversations',
    'Get adequate sleep which helps memory consolidation',
    'Eat a diet rich in omega-3 fatty acids and antioxidants',
    'Use memory aids like notes, calendars, and alarms',
    'Break large tasks into smaller, manageable steps',
    'Manage stress through relaxation techniques'
  ],
  'Anxiety': [
    'Practice deep breathing or progressive muscle relaxation',
    'Engage in regular physical activity',
    'Limit caffeine and alcohol consumption',
    'Maintain a regular sleep schedule',
    'Keep a journal to identify triggers and patterns',
    'Practice mindfulness meditation',
    'Connect with supportive friends and family',
    'Challenge negative thought patterns with evidence-based thinking'
  ],
  'Depression': [
    'Establish a daily routine with regular wake/sleep times',
    'Engage in physical activity, even brief walks',
    'Spend time in nature and sunlight',
    'Connect with supportive people regularly',
    'Set small, achievable goals to build confidence',
    'Practice gratitude by noting positive aspects daily',
    'Limit alcohol and avoid recreational drugs',
    'Pursue activities that previously brought joy, even if motivation is low'
  ],
  'Irritability': [
    'Identify personal triggers and practice avoidance strategies',
    'Ensure adequate sleep and regular sleep patterns',
    'Practice stress management like meditation or deep breathing',
    'Engage in regular physical activity',
    'Maintain stable blood sugar with regular, balanced meals',
    'Limit caffeine and alcohol intake',
    'Take brief time-outs when feeling overwhelmed',
    'Practice communication skills to express needs assertively'
  ],
  'Difficulty Concentrating': [
    'Break tasks into smaller, manageable steps',
    'Eliminate distractions in your work environment',
    'Use techniques like Pomodoro (25 minutes work, 5 minutes break)',
    'Ensure adequate sleep and regular sleep patterns',
    'Stay physically active to improve brain function',
    'Practice mindfulness to train attention',
    'Stay hydrated and maintain stable blood sugar',
    'Consider using organizational tools like lists or apps'
  ],
  'Chest Tightness': [
    'Practice deep breathing exercises focusing on exhaling completely',
    'Identify and avoid triggers like stress or certain foods',
    'Maintain good posture to allow optimal lung expansion',
    'Stay physically active with appropriate exercises',
    'Avoid smoking and secondhand smoke',
    'Use relaxation techniques for stress-related tightness',
    'Maintain a healthy weight to reduce strain on the chest',
    'Follow an action plan developed with your healthcare provider'
  ],
  'Wheezing': [
    'Identify and avoid triggers like allergens or irritants',
    'Maintain a clean living environment to reduce dust and allergens',
    'Use a humidifier in dry environments',
    'Stay hydrated to keep airways moist',
    'Practice breathing exercises to strengthen respiratory muscles',
    'Follow medication plans exactly as prescribed',
    'Maintain a healthy weight to reduce respiratory strain',
    'Avoid exercise in cold, dry air'
  ],
  'Hives': [
    'Track potential triggers in a journal',
    'Take cool showers or apply cool compresses for relief',
    'Wear loose-fitting, cotton clothing',
    'Use fragrance-free, hypoallergenic products',
    'Avoid known allergens in diet and environment',
    'Keep fingernails short to prevent damage from scratching',
    'Try calamine lotion for temporary relief',
    'Practice stress reduction techniques'
  ],
  'Swollen Face': [
    'Apply cold compresses to reduce swelling',
    'Elevate your head while sleeping using extra pillows',
    'Limit salt intake to reduce fluid retention',
    'Stay hydrated to help flush out toxins',
    'Avoid known allergens in food and environment',
    'Use fragrance-free, hypoallergenic skin products',
    'Limit alcohol which can cause inflammation',
    'Track symptoms and potential triggers'
  ],
  'Tongue Swelling': [
    'Avoid potential allergens or irritants',
    'Rinse mouth with cool water or suck on ice chips',
    'Practice good oral hygiene with gentle products',
    'Stay hydrated but avoid extremely hot beverages',
    'Choose soft, non-spicy foods during episodes',
    'Avoid alcohol, tobacco, and acidic foods',
    'Keep a food diary to identify potential triggers',
    'Know the warning signs that require emergency care'
  ],
  'Hoarseness': [
    'Rest your voice as much as possible',
    'Stay hydrated to keep vocal cords moist',
    'Use a humidifier to add moisture to the air',
    'Avoid smoking and secondhand smoke',
    'Limit alcohol and caffeine which can dehydrate',
    'Avoid shouting or whispering (both strain the voice)',
    'Practice proper breathing techniques when speaking',
    'Limit throat clearing which irritates vocal cords'
  ],
  'Difficulty Swallowing': [
    'Eat slowly and take small bites',
    'Chew food thoroughly before attempting to swallow',
    'Choose soft or pureed foods when experiencing difficulty',
    'Stay upright for at least 30 minutes after eating',
    'Avoid dry foods without adding sauces or liquids',
    'Practice swallowing exercises if recommended by a therapist',
    'Maintain good oral hygiene',
    'Take medications with plenty of water unless advised otherwise'
  ],
  'Burning Sensation in Chest': [
    'Eat smaller, more frequent meals rather than large ones',
    'Avoid lying down for 2-3 hours after eating',
    'Elevate the head of your bed 6-8 inches',
    'Avoid trigger foods like spicy, fatty, or acidic items',
    'Limit alcohol, caffeine, and carbonated beverages',
    'Maintain a healthy weight to reduce pressure on the stomach',
    'Wear loose-fitting clothing that does not constrict the abdomen',
    'Manage stress which can increase acid production'
  ],
  'Fainting': [
    'Change positions slowly, especially from lying to standing',
    'Stay well-hydrated throughout the day',
    'Eat regular meals to maintain blood sugar levels',
    'Avoid standing still for long periods',
    'Recognize warning signs like dizziness or visual changes',
    'Sit or lie down immediately when feeling faint',
    'Avoid hot, crowded environments',
    'Wear compression stockings if recommended'
  ],
  'Numbness': [
    'Maintain proper posture, especially when sitting for long periods',
    'Take frequent breaks to change position and stretch',
    'Avoid crossing legs for extended periods',
    'Follow an anti-inflammatory diet rich in fruits and vegetables',
    'Maintain a healthy weight to reduce pressure on nerves',
    'Ensure adequate vitamin B12 intake for nerve health',
    'Use ergonomic tools and furniture',
    'Stay physically active to maintain circulation'
  ],
  'Tingling': [
    'Change positions frequently to improve circulation',
    'Practice gentle stretching of affected areas',
    'Maintain proper posture during work and sleep',
    'Ensure adequate B-vitamin intake, especially B12',
    'Stay physically active to promote circulation',
    'Use ergonomic tools and furniture',
    'Control blood sugar if diabetic',
    'Avoid repetitive motions that compress nerves'
  ],
  'Excessive Sweating': [
    'Wear breathable, natural fabrics like cotton',
    'Apply antiperspirant at night to clean, dry skin',
    'Avoid spicy foods, caffeine, and alcohol',
    'Use absorbent powders in problem areas',
    'Change clothes when they become damp',
    'Stay in air-conditioned environments when possible',
    'Manage stress through relaxation techniques',
    'Stay hydrated to help regulate body temperature'
  ],
  'Cold Hands or Feet': [
    'Keep your entire body warm, not just extremities',
    'Wear layered clothing and insulated gloves/socks',
    'Stay physically active to improve circulation',
    'Avoid caffeine and nicotine which constrict blood vessels',
    'Practice stress management techniques',
    'Soak hands or feet in warm (not hot) water',
    'Avoid tight clothing or accessories that restrict blood flow',
    'Maintain a healthy weight to support circulation'
  ],
  'Brittle Nails': [
    'Keep nails moisturized with hand cream or oil',
    'Avoid harsh nail products like acetone-based removers',
    'Wear gloves when doing dishes or cleaning',
    'File nails in one direction rather than sawing back and forth',
    'Include biotin-rich foods in your diet',
    'Stay hydrated for overall skin and nail health',
    'Avoid using nails as tools for opening or scraping',
    'Keep nails trimmed to minimize breakage'
  ],
  'Muscle Cramping': [
    'Stay well-hydrated, especially during physical activity',
    'Include potassium, calcium, and magnesium-rich foods in diet',
    'Stretch regularly, especially before and after exercise',
    'Warm up properly before physical activity',
    'Avoid exercising to the point of excessive fatigue',
    'Maintain proper electrolyte balance during extended activity',
    'Wear proper footwear for your activities',
    'Apply heat to tight muscles and cold to painful, cramped muscles'
  ],
  'Ankle Pain': [
    'Rest the ankle and limit weight-bearing activities',
    'Apply ice to reduce inflammation',
    'Compress the area with an elastic bandage',
    'Elevate the ankle above heart level when possible',
    'Perform gentle range-of-motion exercises when appropriate',
    'Wear proper footwear with good support',
    'Gradually return to activities as pain allows',
    'Strengthen ankle muscles with appropriate exercises'
  ],
  'Wrist Pain': [
    'Rest the wrist and avoid activities that cause pain',
    'Apply ice to reduce inflammation',
    'Use ergonomic tools and proper posture during activities',
    'Take frequent breaks during repetitive tasks',
    'Wear a wrist splint if recommended',
    'Perform gentle stretching and strengthening exercises',
    'Modify activities to reduce strain on the wrist',
    'Use voice recognition software to reduce typing'
  ],
  'Hip Pain': [
    'Maintain a healthy weight to reduce pressure on the hip joint',
    'Engage in low-impact exercises like swimming or cycling',
    'Apply ice for acute pain or heat for chronic stiffness',
    'Stretch the hip muscles regularly',
    'Strengthen core and hip muscles with appropriate exercises',
    'Use proper footwear with good cushioning',
    'Avoid sitting for prolonged periods',
    'Sleep with a pillow between knees if a side sleeper'
  ],
  'Stiffness': [
    'Maintain regular physical activity appropriate for your condition',
    'Perform gentle stretching exercises daily',
    'Apply heat to stiff areas before activities',
    'Take warm showers or baths to reduce morning stiffness',
    'Stay hydrated to maintain joint lubrication',
    'Maintain good posture throughout the day',
    'Use proper body mechanics during daily activities',
    'Consider yoga or tai chi for improved flexibility'
  ],
  'Swollen Joints': [
    'Rest the affected joints and limit activities that cause pain',
    'Apply ice to reduce inflammation',
    'Elevate the affected area above heart level when possible',
    'Take anti-inflammatory foods like turmeric and ginger',
    'Maintain a healthy weight to reduce pressure on joints',
    'Wear supportive shoes with good cushioning',
    'Use assistive devices when needed to reduce joint stress',
    'Follow an anti-inflammatory diet plan'
  ],
  'Foot Pain': [
    'Wear properly fitting shoes with good arch support',
    'Replace athletic shoes when worn out',
    'Apply ice to reduce inflammation',
    'Perform foot stretches and exercises',
    'Use orthotic inserts if recommended',
    'Maintain a healthy weight to reduce pressure on feet',
    'Avoid prolonged standing on hard surfaces',
    'Elevate feet when resting'
  ],
  'Difficulty Walking': [
    'Use appropriate assistive devices like canes or walkers',
    'Wear supportive, non-slip footwear',
    'Perform exercises to improve strength and balance',
    'Remove home hazards to prevent falls',
    'Take your time and avoid rushing',
    'Consider physical therapy for gait training',
    'Maintain a healthy weight to reduce strain',
    'Rest as needed during longer walking periods'
  ],
  'Eye Discharge': [
    'Clean eyelids gently with warm water and a clean cloth',
    'Wash hands frequently to prevent spreading infection',
    'Avoid touching or rubbing the eyes',
    'Replace eye makeup every 3-6 months',
    'Use clean towels and pillowcases daily during infection',
    'Avoid wearing contact lenses until discharge resolves',
    'Use separate towels for face and body',
    'Apply warm compresses to loosen crusted discharge'
  ],
  'Eye Redness': [
    'Apply cool compresses to soothe irritated eyes',
    'Use artificial tears for dryness',
    'Take regular breaks from screen time (20-20-20 rule)',
    'Avoid allergens and irritants',
    'Wear sunglasses to protect from UV and wind',
    'Avoid rubbing the eyes',
    'Practice good contact lens hygiene',
    'Use a humidifier in dry environments'
  ],
  'Swollen Eyelids': [
    'Apply cold compresses to reduce swelling',
    'Keep the area clean with mild, tear-free cleanser',
    'Avoid makeup until swelling subsides',
    'Sleep with head slightly elevated',
    'Avoid potential allergens',
    'Stay hydrated to help reduce fluid retention',
    'Use fragrance-free, hypoallergenic products around eyes',
    'Avoid rubbing or touching the eyes'
  ],
  'Ear Discharge': [
    'Keep the ear clean and dry',
    'Avoid inserting anything into the ear canal',
    'Use ear drops only as prescribed',
    'Tilt head to allow drainage when cleaning',
    'Avoid swimming until the condition resolves',
    'Use a hair dryer on low setting to dry ears after washing',
    'Sleep with the affected ear up to promote drainage',
    'Complete full course of prescribed antibiotics if bacterial'
  ],
  'Ear Fullness': [
    'Try yawning, chewing gum, or swallowing to open Eustachian tubes',
    'Use a steamy shower to help relieve congestion',
    'Try the Valsalva maneuver (pinch nose and gently blow)',
    'Stay hydrated to thin mucus',
    'Use nasal saline sprays to reduce congestion',
    'Avoid rapid changes in altitude when possible',
    'Keep allergies under control',
    'Avoid placing objects in the ear canal'
  ],
  'Itchy Ears': [
    'Avoid inserting objects into the ear canal',
    'Keep ears dry and clean',
    'Use ear drops only as prescribed',
    'Apply a warm compress to relieve itch',
    'Use over-the-counter ear drops for swimmers ear if appropriate',
    'Identify and avoid allergens that may cause reactions',
    'Use hypoallergenic earrings if ears are pierced',
    'Consider a humidifier if dry air contributes to itching'
  ],
  'Facial Pain': [
    'Apply warm or cool compresses based on what provides relief',
    'Practice stress management techniques',
    'Maintain good posture to reduce tension',
    'Perform gentle facial stretches and exercises',
    'Avoid foods that may trigger pain like caffeine or alcohol',
    'Ensure adequate sleep and regular sleep patterns',
    'Stay hydrated throughout the day',
    'Consider massage therapy for tension-related pain'
  ],
  'Jaw Pain': [
    'Apply moist heat or ice packs to the jaw area',
    'Eat soft foods and avoid chewy or crunchy items',
    'Avoid extreme jaw movements like wide yawning',
    'Practice relaxation techniques to reduce jaw clenching',
    'Maintain good posture to reduce facial tension',
    'Avoid chewing gum and biting nails',
    'Try gentle jaw stretching exercises',
    'Consider a mouth guard for nighttime teeth grinding'
  ],
  'Bleeding Gums': [
    'Brush gently twice daily with a soft-bristled toothbrush',
    'Floss daily using proper technique',
    'Use an antimicrobial or antiseptic mouthwash',
    'Include vitamin C rich foods for gum health',
    'Increase vitamin K intake which helps blood clotting',
    'Quit smoking which impairs gum healing',
    'Maintain regular dental cleanings and check-ups',
    'Replace your toothbrush every 3-4 months'
  ],
  'Toothache': [
    'Rinse with warm salt water',
    'Use dental floss to remove trapped food',
    'Apply a cold compress to the outside of the cheek',
    'Take over-the-counter pain relievers as directed',
    'Use clove oil applied with a cotton ball for temporary relief',
    'Avoid very hot, cold, or sweet foods and drinks',
    'Elevate your head while sleeping',
    'Schedule a dental appointment promptly'
  ],
  'Frequent Coughing': [
    'Stay well-hydrated to thin mucus secretions',
    'Use a humidifier to add moisture to the air',
    'Avoid irritants like smoke, dust, and strong fragrances',
    'Try honey (for adults and children over 1 year) to soothe throat',
    'Suck on throat lozenges to reduce cough reflex',
    'Elevate head while sleeping to reduce postnasal drip',
    'Avoid dairy products which can thicken mucus',
    'Track triggers and patterns of your cough'
  ],
  'Coughing Blood': [
    'Rest as much as possible',
    'Stay well-hydrated with water and clear fluids',
    'Avoid physical exertion until evaluated by a doctor',
    'Avoid smoking and secondhand smoke',
    'Take medications exactly as prescribed',
    'Keep track of amount and frequency of blood',
    'Avoid blood-thinning foods or supplements unless approved',
    'Seek immediate medical attention if bleeding is significant'
  ],
  'Nasal Congestion': [
    'Use saline nasal sprays or irrigation',
    'Apply warm compresses over the nose and sinuses',
    'Stay well-hydrated to thin mucus',
    'Use a humidifier, especially while sleeping',
    'Sleep with head elevated to improve drainage',
    'Try steam inhalation with shower or bowl of hot water',
    'Avoid known allergens and irritants',
    'Exercise regularly to improve circulation and breathing'
  ],
 'Flatulence': [
    'Eat smaller, more frequent meals',
    'Reduce air swallowing and ease digestion to minimize gas buildup',
    'Avoid gas-producing foods',
    'Limit beans, broccoli, and carbonated drinks to decrease flatulence',
    'Chew food slowly and thoroughly',
    'Prevent excess air intake and improve digestion to reduce gas',
    'Stay active after meals',
    'Promote intestinal movement to help expel gas naturally'
  ],
    'Excessive Thirst': [
    'Track your fluid intake and symptoms in a journal',
    'Identify patterns to determine if thirst is linked to medical issues',
    'Prevent dehydration by sipping water regularly to manage thirst',
    'Choose water over sugary or caffeinated beverages',
    'Avoid drinks that can worsen thirst or dehydration',
    'Eat complex carbohydrates to stabilize blood sugar',
    'Maintain stable glucose levels to reduce thirst related to diabetes',
  ],



  'Post-Nasal Drip': [
    'Stay well-hydrated to thin mucus',
    'Use saline nasal sprays or irrigation',
    'Sleep with head elevated to prevent mucus accumulation',
    'Try spicy foods to temporarily thin mucus',
    'Avoid dairy products which may thicken mucus',
    'Use a humidifier to moisten air',
    'Identify and avoid allergens when possible',
    'Gargle with salt water to soothe the throat'
  ],
  'Increased Heart Rate': [
    'Practice deep breathing exercises during episodes',
    'Avoid stimulants like caffeine and nicotine',
    'Stay well-hydrated throughout the day',
    'Engage in regular aerobic exercise (with doctors approval)',
    'Manage stress through relaxation techniques',
    'Maintain regular sleep patterns',
    'Limit alcohol consumption',
    'Track heart rate patterns and potential triggers'
  ],
  'Sexual Dysfunction': [
    'Communicate openly with partners about needs and concerns',
    'Manage chronic health conditions as directed',
    'Reduce stress through relaxation techniques',
    'Maintain physical activity appropriate for your health',
    'Limit alcohol consumption and avoid recreational drugs',
    'Ensure adequate sleep and regular sleep patterns',
    'Consider counseling or therapy for psychological factors',
    'Practice mindfulness to stay present during intimacy'
  ],
  'Irregular Periods': [
    'Track your cycle to identify patterns',
    'Maintain a healthy weight',
    'Manage stress through relaxation techniques',
    'Engage in regular, moderate exercise',
    'Follow a balanced diet rich in whole foods',
    'Ensure adequate sleep and regular sleep patterns',
    'Limit caffeine and alcohol consumption',
    'Avoid extreme dieting or excessive exercise'
  ],
  'Breast Pain': [
    'Wear a properly fitted, supportive bra',
    'Apply warm or cool compresses based on what provides relief',
    'Reduce salt intake to decrease fluid retention',
    'Limit caffeine consumption',
    'Take over-the-counter pain relievers as directed',
    'Track pain patterns throughout your cycle',
    'Consider reducing fat intake',
    'Practice stress reduction techniques'
  ],
  'Menstrual Cramps': [
    'Apply a heating pad to the lower abdomen',
    'Take warm baths to relax pelvic muscles',
    'Stay physically active with light exercise like walking',
    'Practice yoga poses that target pelvic tension',
    'Stay hydrated and avoid caffeine during periods',
    'Take over-the-counter pain relievers as directed',
    'Try dietary supplements like omega-3s, vitamin E, or magnesium',
    'Consider acupressure or massage for relief'
  ],
  'Vaginal Discharge': [
    'Wear cotton underwear and avoid tight-fitting pants',
    'Avoid douches and scented feminine products',
    'Change out of wet swimwear or workout clothes promptly',
    'Wipe from front to back after using the toilet',
    'Use mild, unscented soap for washing external areas only',
    'Change sanitary products frequently during menstruation',
    'Follow a diet low in sugar and refined carbohydrates',
    'Track changes in color, consistency, and odor'
  ],
  'Vaginal Itching': [
    'Wear loose-fitting, cotton underwear',
    'Avoid scented soaps, bubble baths, and feminine products',
    'Change out of wet or sweaty clothes promptly',
    'Pat dry after bathing rather than rubbing',
    'Use only water or mild, unscented soap for cleansing',
    'Avoid douching which disrupts natural balance',
    'Follow a diet low in sugar to prevent yeast overgrowth',
    'Maintain proper wiping technique (front to back)'
  ],
  'Testicular Pain': [
    'Rest and avoid strenuous activities',
    'Apply ice packs for short periods to reduce swelling',
    'Wear supportive underwear or athletic supporter',
    'Take over-the-counter pain relievers as directed',
    'Avoid activities that increase pain or discomfort',
    'Elevate the scrotum when lying down',
    'Practice monthly self-examinations',
    'Maintain good hygiene'
  ],
  'Blood in Stool': [
    'Increase dietary fiber gradually to soften stool',
    'Stay well-hydrated throughout the day',
    'Avoid straining during bowel movements',
    'Take warm sitz baths for hemorrhoid-related bleeding',
    'Avoid alcohol, caffeine, and spicy foods',
    'Exercise regularly to promote healthy bowel function',
    'Keep a food diary to identify potential triggers',
    'Seek immediate medical attention for heavy bleeding'
  ],
  'Heartburn': [
    'Eat smaller, more frequent meals throughout the day',
    'Avoid lying down for 2-3 hours after eating',
    'Elevate the head of your bed 6-8 inches',
    'Identify and avoid trigger foods like spicy or fatty items',
    'Maintain a healthy weight to reduce abdominal pressure',
    'Wear loose-fitting clothing around the waist',
    'Limit alcohol, caffeine, and carbonated beverages',
    'Chew food thoroughly and eat slowly'
  ],
  'Bloating': [
    'Eat smaller, more frequent meals throughout the day',
    'Avoid gas-producing foods like beans and cabbage',
    'Limit carbonated beverages and drinking through straws',
    'Stay physically active to stimulate digestive movement',
    'Try probiotics to support gut health',
    'Identify potential food intolerances',
    'Eat slowly and chew food thoroughly',
    'Reduce salt intake to limit water retention'
  ]
};

// The main component
function SymptomChecker() {
  // State management
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [severity, setSeverity] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [symptomHistory, setSymptomHistory] = useState([]);
  const [bookmarkedSymptoms, setBookmarkedSymptoms] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState('symptom-selector');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Local Storage Persistence
  useEffect(() => {
    const savedHistory = localStorage.getItem('symptomHistory');
    const savedBookmarks = localStorage.getItem('bookmarkedSymptoms');
    const savedDarkMode = localStorage.getItem('symptomCheckerDarkMode');
    
    if (savedHistory) setSymptomHistory(JSON.parse(savedHistory));
    if (savedBookmarks) setBookmarkedSymptoms(JSON.parse(savedBookmarks));
    if (savedDarkMode) setDarkMode(savedDarkMode === 'true');
  }, []);

  // Save to local storage when states change
  useEffect(() => {
    localStorage.setItem('symptomHistory', JSON.stringify(symptomHistory));
    localStorage.setItem('bookmarkedSymptoms', JSON.stringify(bookmarkedSymptoms));
    localStorage.setItem('symptomCheckerDarkMode', darkMode.toString());
  }, [symptomHistory, bookmarkedSymptoms, darkMode]);

  // Custom debounce
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Search handler
  const handleSearch = useCallback(
    debounce((value) => {
      setSearchTerm(value);
    }, 300),
    []
  );

  // Filter symptoms by search term and category
  const filteredSymptoms = useMemo(() => {
    return symptomsData.filter((symptom) => {
      const matchesSearch = !searchTerm || 
        symptom.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || 
        symptom.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory]);

  // Toggle symptom selection
  const toggleSymptom = (symptomId) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId)
        ? prev.filter((id) => id !== symptomId)
        : [...prev, symptomId]
    );
    setError('');
  };

  // Handle severity change
  const handleSeverityChange = (symptomId, value) => {
    setSeverity((prev) => ({
      ...prev,
      [symptomId]: value,
    }));
  };

  // Toggle bookmark for a symptom
  const toggleBookmark = (symptomId) => {
    setBookmarkedSymptoms(prev => {
      if (prev.includes(symptomId)) {
        return prev.filter(id => id !== symptomId);
      } else {
        return [...prev, symptomId];
      }
    });
    
    showNotification(`Symptom ${bookmarkedSymptoms.includes(symptomId) ? 'removed from' : 'added to'} bookmarks`, 'info');
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  // Analyze symptoms
  const analyzeSymptoms = () => {
    if (selectedSymptoms.length === 0) {
      setError('Please select at least one symptom to proceed.');
      setShowResults(false);
      return;
    }

    // Add to history
    const historyEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      symptoms: selectedSymptoms.map(id => {
        const symptom = symptomsData.find(s => s.id === id);
        return {
          id,
          name: symptom.name,
          severity: severity[id] || 'Not specified'
        };
      })
    };
    
    setSymptomHistory(prev => [historyEntry, ...prev].slice(0, 10)); // Keep only 10 most recent
    setShowResults(true);
    setError('');
    setActiveTab('results');
    showNotification('Analysis complete!', 'success');
  };

  // Get results for display
  const getResults = () => {
    const results = [];
    selectedSymptoms.forEach((symptomId) => {
      const symptom = symptomsData.find((s) => s.id === symptomId);
      if (symptom) {
        results.push({
          id: symptomId,
          symptom: symptom.name,
          category: symptom.category,
          severity: severity[symptomId] || 'Not specified',
          conditions: conditionMappings[symptom.name] || [],
          products: productSuggestions[symptom.name] || [],
          devices: deviceRecommendations[symptom.name] || [],
          tests: testMappings[symptom.name] || [],
          tips: healthyTips[symptom.name] || []
        });
      }
    });
    return results;
  };

  // Export report as PDF
  const exportReport = () => {
    const results = getResults();
    const report = `
      Symptom Checker Report
      Date: ${new Date().toLocaleDateString()}
      
      Selected Symptoms:
      ${results
        .map(
          (r) =>
            `- ${r.symptom} (Severity: ${r.severity})\n` +
            `  Possible Conditions: ${r.conditions.map((c) => c.condition).join(', ') || 'None'}\n` +
            `  Solutions: ${r.conditions.map((c) => c.solution).join('; ') || 'Consult a doctor'}\n` +
            `  Products: ${r.products.join(', ') || 'None'}\n` +
            `  Devices: ${r.devices.map((d) => `${d.name} (${d.brand})`).join(', ') || 'None'}\n` +
            `  Tests: ${r.tests.map((t) => t.test).join(', ') || 'None'}\n` +
            `  Healthy Tips: ${r.tips.join(', ') || 'Maintain general wellness'}`
        )
        .join('\n\n')}
      
      Disclaimer: This is not a medical diagnosis. Consult a healthcare professional.
    `;
    
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'symptom-checker-report.txt';
    a.click();
    URL.revokeObjectURL(url);
    
    showNotification('Report downloaded successfully', 'success');
  };

  // Clear all selected symptoms
  const clearAll = () => {
    setSelectedSymptoms([]);
    setSeverity({});
    setShowResults(false);
    setError('');
    showNotification('All selections cleared', 'info');
  };

  // Restore a previous analysis from history
  const restoreFromHistory = (historyItem) => {
    const symptomIds = historyItem.symptoms.map(s => s.id);
    const newSeverity = {};
    
    historyItem.symptoms.forEach(symptom => {
      newSeverity[symptom.id] = symptom.severity;
    });
    
    setSelectedSymptoms(symptomIds);
    setSeverity(newSeverity);
    setActiveTab('symptom-selector');
    showNotification('Previous analysis restored', 'success');
  };

  // Delete from history
  const deleteFromHistory = (historyId) => {
    setSymptomHistory(prev => prev.filter(item => item.id !== historyId));
    showNotification('Item removed from history', 'info');
  };

  // Categorize symptoms by body system for visualization
  const getSymptomsByCategory = () => {
    const categories = {};
    selectedSymptoms.forEach(symptomId => {
      const symptom = symptomsData.find(s => s.id === symptomId);
      if (symptom) {
        if (!categories[symptom.category]) {
          categories[symptom.category] = [];
        }
        categories[symptom.category].push(symptom.name);
      }
    });
    
    // Convert to format for chart
    return Object.keys(categories).map(category => ({
      name: category,
      value: categories[category].length,
      symptoms: categories[category].join(', ')
    }));
  };

  // Get urgency level distribution
  const getUrgencyDistribution = () => {
    const urgencyLevels = { Critical: 0, High: 0, Moderate: 0, Low: 0 };
    
    selectedSymptoms.forEach(symptomId => {
      const symptom = symptomsData.find(s => s.id === symptomId);
      if (symptom && conditionMappings[symptom.name]) {
        conditionMappings[symptom.name].forEach(condition => {
          if (condition.urgency === 'Critical') urgencyLevels.Critical++;
          else if (condition.urgency === 'High') urgencyLevels.High++;
          else if (condition.urgency === 'Moderate') urgencyLevels.Moderate++;
          else urgencyLevels.Low++;
        });
      }
    });
    
    return Object.keys(urgencyLevels).map(level => ({
      name: level,
      value: urgencyLevels[level]
    }));
  };

  // Navigation tabs
  const navigationTabs = [
    { id: 'symptom-selector', name: 'Symptom Selector', icon: '🔍' },
    { id: 'results', name: 'Analysis Results', icon: '📊' },
    { id: 'recommendations', name: 'Recommendations', icon: '💊' },
    { id: 'history', name: 'History', icon: '📜' }
  ];

  // COLORS for charts and UI
  const COLORS = {
    critical: '#e53e3e',
    high: '#dd6b20',
    moderate: '#d69e2e',
    low: '#38a169',
    info: '#3182ce',
    cardio: '#805ad5',
    neuro: '#d53f8c',
    respiratory: '#38b2ac',
    digestive: '#dd6b20',
    general: '#718096'
  };

  return (
    <div className={`symptom-checker ${darkMode ? 'dark-mode' : ''}`}>
      {/* Notification Toast */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <span className="notification-message">{notification.message}</span>
        </div>
      )}

      <header className="dashboard-header">
        <h1>Symptom Checker</h1>
        <p>Analyze symptoms, explore possible causes, and find recommended solutions</p>
        <div className="header-actions">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="mode-toggle"
          >
            {darkMode ? 'Light Mode ☀️' : 'Dark Mode 🌙'}
          </button>
          {showResults && (
            <button 
              onClick={exportReport}
              className="export-button"
            >
              Export Report 📄
            </button>
          )}
        </div>
      </header>

      {/* Navigation */}
      <div className="navigation-tabs">
        {navigationTabs.map(tab => (
          <button 
            key={tab.id}
            className={activeTab === tab.id ? 'active' : ''}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>

      {/* Disclaimer */}
      <section className="dashboard-section disclaimer">
        <h2>Important Disclaimer</h2>
        <p>
          This Symptom Checker is an informational tool and not a substitute for professional medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider for medical concerns. For emergencies, dial emergency services immediately or visit the nearest hospital.
        </p>
      </section>

      {/* Symptom Selection */}
      {activeTab === 'symptom-selector' && (
        <section className="dashboard-section symptom-selector">
          <h2>Select Your Symptoms</h2>
          <p>Choose symptoms you're experiencing and specify severity for personalized insights.</p>
          
          <div className="search-filter-container">
            <div className="search-input">
              <input
                type="text"
                placeholder="Search symptoms (e.g., headache, cough)"
                onChange={(e) => handleSearch(e.target.value)}
                aria-label="Search symptoms"
              />
            </div>
            
            <div className="category-filters">
              {symptomCategories.map(category => (
                <button
                  key={category.id}
                  className={selectedCategory === category.id ? 'active' : ''}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="selected-count">
            {selectedSymptoms.length > 0 ? (
              <span>Selected symptoms: {selectedSymptoms.length}</span>
            ) : (
              <span>No symptoms selected</span>
            )}
            {selectedSymptoms.length > 0 && (
              <button 
                className="clear-button"
                onClick={clearAll}
              >
                Clear All
              </button>
            )}
          </div>
          
          <div className="symptom-list">
            {filteredSymptoms.length > 0 ? (
              filteredSymptoms.map((symptom) => (
                <div key={symptom.id} className="symptom-item">
                  <div className="symptom-checkbox">
                    <input
                      type="checkbox"
                      id={`symptom-${symptom.id}`}
                      checked={selectedSymptoms.includes(symptom.id)}
                      onChange={() => toggleSymptom(symptom.id)}
                    />
                    <label htmlFor={`symptom-${symptom.id}`}>
                      {symptom.name} 
                      <span className="symptom-category">({symptom.category})</span>
                    </label>
                  </div>
                  
                  <div className="symptom-actions">
                    {selectedSymptoms.includes(symptom.id) && (
                      <select
                        value={severity[symptom.id] || ''}
                        onChange={(e) => handleSeverityChange(symptom.id, e.target.value)}
                        aria-label={`Severity for ${symptom.name}`}
                        className="severity-select"
                      >
                        <option value="">Severity</option>
                        <option value="Mild">Mild</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Severe">Severe</option>
                      </select>
                    )}
                    
                    <button 
                      className={`bookmark-button ${bookmarkedSymptoms.includes(symptom.id) ? 'active' : ''}`}
                      onClick={() => toggleBookmark(symptom.id)}
                      aria-label={bookmarkedSymptoms.includes(symptom.id) ? 'Remove bookmark' : 'Bookmark symptom'}
                    >
                      {bookmarkedSymptoms.includes(symptom.id) ? '★' : '☆'}
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-results">No symptoms match your search. Try another term or category.</p>
            )}
          </div>
          
          {error && <p className="error">{error}</p>}
          
          <button 
            className="analyze-button"
            onClick={analyzeSymptoms}
            disabled={selectedSymptoms.length === 0}
          >
            Analyze Symptoms
          </button>
        </section>
      )}

      {/* Results */}
      {activeTab === 'results' && showResults && (
        <section className="dashboard-section results">
          <h2>Analysis Results</h2>
          <p>Explore possible conditions and solutions based on your symptoms. Remember to consult a healthcare professional for proper diagnosis.</p>













       {/*  
           // Visual summary *

          <div className="results-summary">
            <div className="summary-card">
              <h3>Symptoms by Body System</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={getSymptomsByCategory()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {getSymptomsByCategory().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={COLORS[entry.name.toLowerCase()] || `#${Math.floor(Math.random()*16777215).toString(16)}`} 
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [props.payload.symptoms, name]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="summary-card">
              <h3>Urgency Level Distribution</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={getUrgencyDistribution()}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Conditions">
                      {getUrgencyDistribution().map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.name === 'Critical' ? COLORS.critical :
                            entry.name === 'High' ? COLORS.high :
                            entry.name === 'Moderate' ? COLORS.moderate :
                            COLORS.low
                          } 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
*/}



          
          
          {/* Detailed results */}
          <div className="detailed-results">
            {getResults().length > 0 ? (
              getResults().map((result, index) => (
                <div key={index} className="result-item">
                  <div className="result-header">
                    <h3>{result.symptom}</h3>
                    <span className={`severity-tag ${result.severity.toLowerCase()}`}>
                      {result.severity}
                    </span>
                  </div>
                  
                  <div className="possible-conditions">
                    <h4>Possible Conditions & Solutions:</h4>
                    {result.conditions.length > 0 ? (
                      <ul className="conditions-list">
                        {result.conditions.map((cond, i) => (
                          <li key={i} className={`condition-item ${cond.urgency.toLowerCase()}`}>
                            <div className="condition-header">
                              <span className="condition-name">{cond.condition}</span>
                              <span className="condition-probability">{cond.probability}</span>
                              <span className={`urgency-indicator ${cond.urgency.toLowerCase()}`}>
                                {cond.urgency}
                              </span>
                            </div>
                            <p className="condition-solution">{cond.solution}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="no-data">No specific conditions identified. Please consult a doctor for proper diagnosis.</p>
                    )}
                  </div>
                  
                  {result.products.length > 0 && (
                    <div className="products-section">
                      <h4>Suggested Products:</h4>
                      <div className="product-tags">
                        {result.products.map((product, i) => (
                          <span key={i} className="product-tag">{product}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="no-results">No results available. Please select symptoms and try again.</p>
            )}
          </div>



{/* Comprehensive Single Disclaimer Section */}
<div className="disclaimer-section">
  <div className="disclaimer-content">
    <h3>Important Disclaimer</h3>
    
    <div className="disclaimer-intro">
      <p>Explore possible conditions and solutions based on your symptoms. This service provides informational guidance to help you understand potential health insights.</p>
    </div>
    
    <div className="disclaimer-key-points">
      <ul>
        <li>Results are algorithmic and not a definitive medical diagnosis</li>
        <li>Product suggestions are general recommendations only</li>
        <li>Consult healthcare professionals for proper medical evaluation</li>
        <li>Conditions and solutions vary by individual health factors</li>
      </ul>
    </div>
    
    <div className="disclaimer-warning">
      <p>
        <strong>Medical Emergency?</strong> Contact emergency services immediately.
      </p>
    </div>
    
    <div className="disclaimer-footer">
      <p>By using this service, you acknowledge the information is provided "as is" without warranties.</p>
    </div>
  </div>
</div>

        </section>
      )}









      {/* Recommendations */}
      {activeTab === 'recommendations' && showResults && (
        <section className="dashboard-section recommendations">
          <h2>Personalized Recommendations</h2>
          <p>Based on your symptoms, here are device recommendations, diagnostic tests, and health tips.</p>


{/* Device Recommendations */}
<div className="recommendation-section devices">
  <h3>Recommended Health Monitoring Devices</h3>
  <p className="section-desc">Essential devices to track and manage your health effectively</p>
  
  <div className="devices-container">
    {getResults().some(r => r.devices && r.devices.length > 0) ? (
      getResults().map((result, index) =>
        result.devices && result.devices.length > 0 ? (
          <div key={index} className="device-group">
            <h4>{result.symptom} Monitoring Devices</h4>
            <div className="devices-grid">
              {result.devices.map((device, i) => (
                <div key={i} className="device-card">
                  <div className="device-details">
                    <h5>{device.name}</h5>
                    <p className="device-brand">Manufacturer: {device.brand}</p>
                    <p className="device-description">{device.use}</p>
                    <a 
                      href={device.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="device-link"
                    >
                      Explore Device
                      <span className="link-arrow">→</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )
    ) : (
      <p className="no-devices">No specific devices recommended for your symptoms.</p>
    )}
  </div>
  
 
</div>

{/* Diagnostic Tests */}
<div className="recommendation-section tests">
  <h3>Recommended Diagnostic Tests</h3>
  <p className="section-desc">Comprehensive tests to help understand your health condition</p>
  
  <div className="tests-container">
    {getResults().some(r => r.tests && r.tests.length > 0) ? (
      getResults().map((result, index) =>
        result.tests && result.tests.length > 0 ? (
          <div key={index} className="test-group">
            <h4>{result.symptom} Diagnostic Investigations</h4>
            <div className="tests-grid">
              {result.tests.map((test, i) => (
                <div key={i} className="test-card">
                  <div className="test-details">
                    <h5>{test.test}</h5>
                    <p className="test-provider">Provider: {test.provider}</p>
                    <a 
                      href={test.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="test-link"
                    >
                      Book Test
                      <span className="link-arrow">→</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null
      )
    ) : (
      <p className="no-tests">No specific tests recommended for your symptoms.</p>
    )}
  </div>
</div>


          
          {/* Health Tips */}
          <div className="recommendation-section tips">
            <h3>Healthy Living Tips</h3>
            <p className="section-desc">Adopt these lifestyle practices to help manage your symptoms and improve overall wellness.</p>
            
            <div className="recommendations-grid">
              {getResults().some(r => r.tips && r.tips.length > 0) ? (
                getResults().map((result, index) =>
                  result.tips && result.tips.length > 0 ? (
                    <div key={index} className="recommendation-card">
                      <div className="card-header">
                        <h4>{result.symptom}</h4>
                      </div>
                      <ul className="tip-list">
                        {result.tips.map((tip, i) => (
                          <li key={i}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                )
              ) : (
                <p className="no-data">General tip: Maintain a balanced diet, stay hydrated, and consult a doctor for persistent symptoms.</p>
              )}
            </div>
         
         
          </div>
          
          
          {/* Online Medicine Shops */}
          <div className="recommendation-section medicine-shops">
            <h3>Online Medicine Shops</h3>
            <p className="section-desc">Purchase health products from these trusted e-pharmacies.</p>
            <div className="shops-grid">
              {medicineShops.map((shop, index) => (
                <a
                  key={index}
                  href={shop.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shop-item"
                >
                  {shop.name}
                </a>
              ))}
            </div>
          </div>
       


{/* Combined Comprehensive Disclaimer */}
<div className="comprehensive-disclaimer">
      <h3>Important Health Information Disclaimer</h3>
      <p>
        The recommendations, devices, tests, health tips, and online pharmacy information 
        provided are for informational purposes only and should not be considered medical advice. 
        Always consult with a qualified healthcare professional before making any decisions 
        about your health, medical devices, diagnostic tests, or treatments.
      </p>
      <div className="disclaimer-details">
        <ul>
          <li>These recommendations are generated based on reported symptoms</li>
          <li>Individual health needs vary and require personalized medical evaluation</li>
          <li>Verify the legitimacy of online pharmacies and medical resources</li>
          <li>Professional medical advice should always be prioritized</li>
        </ul>
      </div>
    </div>
  

        </section>
      )}





      {/* History */}
      {activeTab === 'history' && (
        <section className="dashboard-section history">
          <h2>Search History</h2>
          
          <div className="history-section">
            <h3>Recent Searches</h3>
            {symptomHistory.length > 0 ? (
              <div className="history-list">
                {symptomHistory.map((item) => (
                  <div key={item.id} className="history-item">
                    <div className="history-date">
                      {new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString()}
                    </div>
                    <div className="history-symptoms">
                      {item.symptoms.map((s) => (
                        <span key={s.id} className="history-symptom-tag">
                          {s.name} ({s.severity})
                        </span>
                      ))}
                    </div>
                    <div className="history-actions">
                      <button 
                        onClick={() => restoreFromHistory(item)}
                        className="restore-button"
                      >
                        Restore
                      </button>
                      <button 
                        onClick={() => deleteFromHistory(item.id)}
                        className="delete-button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-data">No search history available yet.</p>
            )}
          </div>
          
          <div className="bookmarks-section">
            <h3>Bookmarked Symptoms</h3>
            {bookmarkedSymptoms.length > 0 ? (
              <div className="bookmarks-grid">
                {bookmarkedSymptoms.map((id) => {
                  const symptom = symptomsData.find(s => s.id === id);
                  return symptom ? (
                    <div key={id} className="bookmark-item">
                      <span className="bookmark-name">{symptom.name}</span>
                      <span className="bookmark-category">({symptom.category})</span>
                      <button 
                        onClick={() => toggleBookmark(id)}
                        className="remove-bookmark"
                      >
                        Remove
                      </button>
                    </div>
                  ) : null;
                })}
              </div>
            ) : (
              <p className="no-data">No bookmarked symptoms. Click the star icon to bookmark symptoms for quick access.</p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}

export default SymptomChecker;