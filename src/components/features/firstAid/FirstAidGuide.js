// src/components/features/firstAid/FirstAidGuide.js
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './FirstAidGuide.css';

function FirstAidGuide() {
  const { darkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [bookmarkedGuides, setBookmarkedGuides] = useState([]);
  const [callModalOpen, setCallModalOpen] = useState(false);

  // Emergency categories
  const categories = [
    { id: 'all', name: 'All Emergencies' },
    { id: 'cardio', name: 'Cardiac Emergencies' },
    { id: 'breathing', name: 'Breathing Problems' },
    { id: 'injuries', name: 'Injuries & Wounds' },
    { id: 'env', name: 'Environmental Emergencies' },
    { id: 'medical', name: 'Medical Conditions' }
  ];

  // Emergency guides database
  const emergencyGuides = [
    {
      id: 'cpr',
      title: 'CPR for Adults',
      category: 'cardio',
      urgency: 'critical',
      icon: '❤️',
      shortDescription: 'How to perform cardiopulmonary resuscitation on an unresponsive adult.',
      overview: 'CPR can help save a life during a cardiac or breathing emergency. However, even if yoa ure trained, remember that CPR is just one part of the process. Emergency medical services (EMS) should be activated immediately (call local emergency number).',
      steps: [
        {
          title: 'Check the scene and the person',
          description: 'Make sure the scene is safe, then tap the person on the shoulder and shout "Are you OK?" to ensure they need help.'
        },
        {
          title: 'Call 911 for assistance',
          description: 'If the person does not respond, call 911 or ask a bystander to do so. If possible, ask a bystander to find an AED.'
        },
        {
          title: 'Open the airway',
          description: 'With the person lying on their back, tilt their head back slightly to lift the chin.'
        },
        {
          title: 'Check for breathing',
          description: 'Listen carefully for sounds of breathing for no more than 10 seconds. Occasional gasps are not breathing.'
        },
        {
          title: 'Begin chest compressions',
          description: 'If the person is not breathing, place the heel of your hand on the center of the chest, then place your other hand on top and lock your elbows. Begin compressions at a rate of 100-120 per minute, allowing the chest to recoil completely between compressions.'
        },
        {
          title: 'Deliver rescue breaths',
          description: 'After 30 compressions, give 2 rescue breaths if trained in CPR. Tilt the head back and lift the chin up, pinch the nose shut, then make a complete seal over their mouth with yours and blow in for about 1 second to make the chest visibly rise.'
        },
        {
          title: 'Continue CPR',
          description: 'Continue the cycle of 30 chest compressions and 2 rescue breaths until medical professionals arrive or the person begins to breathe or move.'
        }
      ],
      warnings: [
        'If you are not trained in CPR, provide hands-only CPR (chest compressions without rescue breaths).',
        'If available, use an Automated External Defibrillator (AED) by following the device instructions.',
        'Do not delay starting CPR to look for an AED.'
      ],
      videoLink: 'https://example.com/cpr-tutorial'
    },
    {
      id: 'choking',
      title: 'Choking Response',
      category: 'breathing',
      urgency: 'critical',
      icon: '🫁',
      shortDescription: 'How to help someone who is choking and cannot breathe.',
      overview: 'Choking occurs when a foreign object gets lodged in the throat or windpipe, blocking the flow of air. If the person can cough forcefully, encourage them to keep coughing. However, if they can not speak, cough, or breathe, the situation is critical.',
      steps: [
        {
          title: 'Verify choking',
          description: 'Ask "Are you choking?" If the person is unable to speak, cough, or breathe, proceed with the next steps.'
        },
        {
          title: 'Stand behind the person',
          description: 'Position yourself behind the person. If they are seated, kneel or stand behind their chair.'
        },
        {
          title: 'Position your hands',
          description: 'Reach around the persons abdomen. Make a fist with one hand, placing the thumb side just above their navel (belly button).'
        },
        {
          title: 'Perform abdominal thrusts (Heimlich maneuver)',
          description: 'Grab your fist with your other hand. Press into the abdomen with quick, upward thrusts. Continue until the object is expelled or the person becomes unconscious.'
        },
        {
          title: 'For unconscious person',
          description: 'If the person becomes unconscious, lower them to the ground and begin CPR, starting with chest compressions. Check the mouth for visible objects before giving breaths.'
        }
      ],
      warnings: [
        'For pregnant women or obese individuals, perform chest thrusts instead of abdominal thrusts.',
        'Never perform abdominal thrusts on infants younger than 1 year. Instead, hold the infant face down along your forearm with their head lower than their trunk. Deliver 5 back blows followed by 5 chest thrusts.',
        'If the person can cough forcefully, do not interfere with their attempts to cough up the object.'
      ],
      videoLink: 'https://example.com/choking-response'
    },
    {
      id: 'bleeding',
      title: 'Severe Bleeding Control',
      category: 'injuries',
      urgency: 'critical',
      icon: '🩸',
      shortDescription: 'How to stop severe bleeding in emergency situations.',
      overview: 'Severe bleeding can be life-threatening and needs immediate attention. The main goal is to stop the bleeding as quickly as possible through direct pressure, wound elevation, and pressure points.',
      steps: [
        {
          title: 'Ensure safety',
          description: 'Make sure it is safe to approach the injured person. If possible, wear protective gloves to minimize exposure to blood.'
        },
        {
          title: 'Expose the wound',
          description: 'Remove or cut away clothing to clearly see the wound and the source of bleeding.'
        },
        {
          title: 'Apply direct pressure',
          description: 'Using a clean cloth, gauze, or even your hand (if nothing else is available), apply firm pressure directly on the wound. Keep pressing until the bleeding stops.'
        },
        {
          title: 'Elevate the wound',
          description: 'If possible, elevate the injured area above the level of the heart to help reduce blood flow to the wound.'
        },
        {
          title: 'Apply pressure to pressure points',
          description: 'If bleeding continues, apply pressure to the appropriate pressure point (e.g., brachial artery for arm wounds, femoral artery for leg wounds).'
        },
        {
          title: 'Apply a tourniquet as last resort',
          description: 'If bleeding cannot be controlled by direct pressure and elevation, and a tourniquet is available, apply it according to instructions. Mark the time of application clearly.'
        },
        {
          title: 'Seek immediate medical attention',
          description: 'Call emergency services (911) or get the person to an emergency room as quickly as possible.'
        }
      ],
      warnings: [
        'Do not remove bandages if blood soaks through – add more padding on top and continue applying pressure.',
        'Use tourniquets only as a last resort for life-threatening limb bleeding that cannot be controlled by other means.',
        'Never apply a tourniquet on joints, and do not loosen it once applied – let medical professionals handle it.'
      ],
      videoLink: 'https://example.com/bleeding-control'
    },
    {
      id: 'burns',
      title: 'Burn Treatment',
      category: 'injuries',
      urgency: 'high',
      icon: '🔥',
      shortDescription: 'How to provide first aid for different types of burns.',
      overview: 'Burns are classified by degrees, with first-degree affecting only the outer layer of skin, second-degree involving the first two layers, and third-degree affecting deeper tissues. The immediate goal is to stop the burning process, relieve pain, and prevent infection.',
      steps: [
        {
          title: 'Stop the burning process',
          description: 'Remove the person from the source of the burn. For chemical burns, remove contaminated clothing and rinse with water. For electrical burns, ensure the person is not in contact with the electrical source before touching them.'
        },
        {
          title: 'Cool the burn',
          description: 'Run cool (not cold) water over the burn or apply a cool, wet compress until the pain subsides. Do this for about 10-15 minutes. Do not use ice, as it can damage the tissue further.'
        },
        {
          title: 'Protect the burned area',
          description: 'Cover the burn loosely with a sterile, non-stick bandage or clean cloth. Do not apply butter, oil, lotion, or ointments to the burn as this can trap heat and increase risk of infection.'
        },
        {
          title: 'Take pain relievers',
          description: 'Over-the-counter pain medications like ibuprofen, naproxen, or acetaminophen can help reduce pain and inflammation.'
        },
        {
          title: 'Monitor for signs of infection',
          description: 'Watch for increased pain, redness, swelling, oozing, or if the person develops a fever. These may indicate infection requiring medical attention.'
        }
      ],
      warnings: [
        'Seek emergency medical help for third-degree burns, burns that cover a large area, or burns on the face, hands, feet, genitals, or major joints.',
        'Do not break blisters, as this increases risk of infection.',
        'For chemical burns, continue rinsing for 20 minutes and remove contaminated clothing and jewelry.'
      ],
      videoLink: 'https://example.com/burn-treatment'
    },
    {
      id: 'fracture',
      title: 'Fractures & Broken Bones',
      category: 'injuries',
      urgency: 'high',
      icon: '🦴',
      shortDescription: 'How to provide first aid for suspected fractures or broken bones.',
      overview: 'A fracture is a broken or cracked bone. It is important not to move the injured area and to immobilize it until medical help arrives. Signs include pain, swelling, deformity, and inability to use the affected area normally.',
      steps: [
        {
          title: 'Keep the person still',
          description: 'Prevent any movement of the injured area. If the person must be moved due to danger, stabilize the injury first.'
        },
        {
          title: 'Stop any bleeding',
          description: 'If there areopen fracture (bone has broken through the skin), apply pressure around the wound with a clean cloth to control bleeding, but do not push on the bone itself.'
        },
        {
          title: 'Immobilize the injured area',
          description: 'If trained to do so, use a splint to immobilize the area. The splint should include the joint above and below the suspected fracture. Use rigid materials (boards, rolled-up magazines) padded with soft material.'
        },
        {
          title: 'Apply cold packs',
          description: 'To reduce pain and swelling, apply ice or a cold pack wrapped in a thin towel. Do not apply ice directly to the skin or for more than 20 minutes at a time.'
        },
        {
          title: 'Treat for shock',
          description: 'Lay the person down with the head slightly lower than the trunk if possible, and elevate the legs if there are no head, neck, back, or leg injuries. Keep them warm and calm.'
        },
        {
          title: 'Seek medical attention',
          description: 'All suspected fractures should be evaluated by medical professionals for proper diagnosis and treatment.'
        }
      ],
      warnings: [
        'Do not attempt to realign a broken bone or push a protruding bone back in place.',
        'If the person has a suspected spinal injury, do not move them unless they are in immediate danger.',
        'Do not move a person with a hip or pelvic fracture unless absolutely necessary.'
      ],
      videoLink: 'https://example.com/fracture-treatment'
    },
    {
      id: 'heart-attack',
      title: 'Heart Attack',
      category: 'cardio',
      urgency: 'critical',
      icon: '💔',
      shortDescription: 'How to recognize and respond to a heart attack.',
      overview: 'A heart attack occurs when blood flow to a part of the heart is blocked, causing damage to the heart muscle. Early recognition and rapid response can save lives and limit heart damage.',
      steps: [
        {
          title: 'Recognize the symptoms',
          description: 'Common symptoms include chest pain or discomfort, upper body discomfort, shortness of breath, cold sweat, nausea, and lightheadedness. Women may experience less obvious symptoms like fatigue, indigestion, and back or jaw pain.'
        },
        {
          title: 'Call emergency services (911)',
          description: 'Do this immediately if you suspect someone is having a heart attack. Don nott wait to see if symptoms improve.'
        },
        {
          title: 'Help the person take aspirin',
          description: 'If the person is not allergic to aspirin and it is readily available, have them chew a regular-strength aspirin (325 mg) or four low-dose aspirin (81 mg each). Aspirin helps prevent blood clotting.'
        },
        {
          title: 'Have them sit down and rest',
          description: 'Help the person find a comfortable sitting position, typically with their knees bent and upper body supported. This position helps reduce strain on the heart.'
        },
        {
          title: 'Loosen tight clothing',
          description: 'Loosen any tight clothing around the neck and waist to make breathing easier and help circulation.'
        },
        {
          title: 'Monitor and be ready for CPR',
          description: 'Stay with the person and monitor their condition. If they become unresponsive and are not breathing normally, begin CPR if trained to do so.'
        }
      ],
      warnings: [
        'Do not let the person drive themselves to the hospital.',
        'Do not give aspirin if the person is allergic or has been advised by a doctor not to take it.',
        'Minutes matter during a heart attack. The sooner emergency treatment begins, the better the chances of survival and recovery.'
      ],
      videoLink: 'https://example.com/heart-attack-response'
    },
    {
      id: 'stroke',
      title: 'Stroke',
      category: 'medical',
      urgency: 'critical',
      icon: '🧠',
      shortDescription: 'How to recognize and respond to a stroke.',
      overview: 'A stroke occurs when blood flow to part of the brain is blocked or when a blood vessel in the brain bursts. Every minute counts during a stroke because brain cells begin to die when deprived of oxygen.',
      steps: [
        {
          title: 'Recognize the signs using FAST',
          description: 'F: Face drooping on one side. A: Arm weakness or inability to raise both arms equally. S: Speech difficulty or slurred speech. T: Time to call emergency services immediately if any of these signs are present.'
        },
        {
          title: 'Note the time symptoms began',
          description: 'This is crucial information for healthcare providers, as certain treatments for stroke are time-sensitive and most effective when given quickly after symptoms begin.'
        },
        {
          title: 'Call emergency services (911)',
          description: 'Do this immediately if you suspect someone is having a stroke, even if symptoms seem to improve or go away.'
        },
        {
          title: 'Have the person lie down',
          description: 'Help them lie down with their head and shoulders slightly elevated to reduce pressure in the brain.'
        },
        {
          title: 'Check airway and breathing',
          description: 'Make sure their airway is clear and they are breathing normally. If they are unconscious and not breathing normally, begin CPR if trained.'
        },
        {
          title: 'Do not give food or drink',
          description: 'A person having a stroke may have difficulty swallowing and could choke.'
        },
        {
          title: 'Reassure the person',
          description: 'Stay calm and reassure the person until emergency services arrive.'
        }
      ],
      warnings: [
        'Never give aspirin for a suspected stroke, as some strokes involve bleeding in the brain and aspirin could make it worse.',
        'Do not let the person drive themselves to the hospital.',
        'Do not delay calling emergency services even if symptoms seem mild or improve.'
      ],
      videoLink: 'https://example.com/stroke-response'
    },
    {
      id: 'hypothermia',
      title: 'Hypothermia',
      category: 'env',
      urgency: 'high',
      icon: '❄️',
      shortDescription: 'How to recognize and treat someone suffering from hypothermia.',
      overview: 'Hypothermia occurs when body temperature drops below 95°F (35°C). It can happen in cold weather, but also after being in cold water or even in cool temperatures if a person is wet or not dressed warmly enough.',
      steps: [
        {
          title: 'Recognize the symptoms',
          description: 'Signs include shivering, confusion, slurred speech, drowsiness, weak pulse, shallow breathing, loss of coordination, and in severe cases, a complete lack of shivering and unconsciousness.'
        },
        {
          title: 'Call emergency services (911)',
          description: 'Moderate to severe hypothermia is a medical emergency and requires immediate medical attention.'
        },
        {
          title: 'Move to a warm location',
          description: 'Get the person out of the cold and into a warm environment as quickly as possible.'
        },
        {
          title: 'Remove wet clothing',
          description: 'Replace wet clothing with dry, warm clothing or blankets. Pay special attention to covering the head, neck, chest, and groin.'
        },
        {
          title: 'Warm the center of the body first',
          description: 'Use warm blankets, clothing, or skin-to-skin contact under loose, dry layers. Focus on warming the chest, neck, head, and groin.'
        },
        {
          title: 'Provide warm beverages',
          description: 'If the person is conscious and able to swallow, give them warm, sweet, non-alcoholic beverages to help increase body temperature.'
        },
        {
          title: 'Use warm, dry compresses',
          description: 'Apply warm (not hot) compresses to the neck, chest wall, and groin. Do not apply directly to the arms and legs, as this can drive cold blood back to the heart, lungs, and brain, causing the core body temperature to drop further.'
        }
      ],
      warnings: [
        'Do not use direct heat such as heat lamps, a fireplace, or a heating pad. These can damage the skin or cause cardiac arrhythmias.',
        'Do not give alcohol, as it causes blood vessels to expand and can lead to further heat loss.',
        'Handle the person gently and do not massage or rub the persons limbs.'
      ],
      videoLink: 'https://example.com/hypothermia-treatment'
    },
    {
      id: 'heatstroke',
      title: 'Heat Stroke',
      category: 'env',
      urgency: 'critical',
      icon: '🌡️',
      shortDescription: 'How to recognize and treat someone suffering from heat stroke.',
      overview: 'Heat stroke is the most serious heat-related illness. It occurs when the body can no longer control its temperature, the sweating mechanism fails, and the body temperature rises rapidly, sometimes reaching 106°F (41.1°C) or higher within 10-15 minutes.',
      steps: [
        {
          title: 'Call emergency services (911)',
          description: 'Heat stroke is a medical emergency and requires immediate professional medical attention.'
        },
        {
          title: 'Move to a cooler location',
          description: 'Get the person out of the heat and into a cool, shaded, or air-conditioned area.'
        },
        {
          title: 'Remove excess clothing',
          description: 'Remove outer clothing and any unnecessary clothing to help the body cool down.'
        },
        {
          title: 'Cool the person rapidly',
          description: 'Use whatever methods available: place in a cool bath or shower, spray with a garden hose, sponge with cool water, place ice packs or cold, wet towels on the neck, armpits, and groin, or fan the person while misting with cool water.'
        },
        {
          title: 'Monitor body temperature',
          description: 'If possible, check the persons temperature regularly and continue cooling efforts until it drops to 101-102°F (38.3-38.9°C).'
        },
        {
          title: 'Give fluids if conscious',
          description: 'If the person is awake and able to swallow, give cool water or a non-alcoholic, non-caffeinated beverage to drink.'
        },
        {
          title: 'Position the person appropriately',
          description: 'If the person is unconscious, place them on their side to prevent choking in case they vomit.'
        }
      ],
      warnings: [
        'Do not give medication to reduce the fever, such as aspirin or acetaminophen, as they may not work on environmental heat stroke and could cause harm.',
        'Do not give alcohol or caffeine, which can worsen dehydration.',
        'Do not use ice baths for elderly people, young children, patients with chronic illness, or anyone experiencing heat stroke not associated with exercise, as it can be dangerous.'
      ],
      videoLink: 'https://example.com/heatstroke-treatment'
    },
    {
      id: 'poisoning',
      title: 'Poisoning',
      category: 'medical',
      urgency: 'high',
      icon: '☠️',
      shortDescription: 'How to respond to suspected poisoning.',
      overview: 'Poisoning can occur from ingestion, inhalation, absorption, or injection of harmful substances. The appropriate response varies based on the type of poison and how it entered the body.',
      steps: [
        {
          title: 'Ensure scene safety',
          description: 'Make sure you are not at risk of being poisoned yourself, especially with gas poisoning or hazardous chemicals.'
        },
        {
          title: 'Call poison control or 911',
          description: 'For ingested poisons, call the Poison Control Center (1-800-222-1222) or 911 immediately. For other types or if the person is unconscious, not breathing, or having seizures, call 911 directly.'
        },
        {
          title: 'Remove the person from danger',
          description: 'For inhaled poisons, get the person to fresh air. For skin contact, remove contaminated clothing and rinse skin.'
        },
        {
          title: 'Identify the poison if possible',
          description: 'Have the container or the substance available to describe to emergency services. If unknown, collect vomit or other samples for identification.'
        },
        {
          title: 'Follow specific instructions',
          description: 'Follow the instructions from poison control or emergency services. Do not induce vomiting or give the person anything to eat or drink unless specifically instructed to do so.'
        },
        {
          title: 'Monitor vital signs',
          description: 'Check the persons breathing, pulse, and level of consciousness while waiting for emergency services.'
        },
        {
          title: 'Position appropriately',
          description: 'If the person is unconscious but breathing, place them in the recovery position (on their side). If the ayre not breathing, begin CPR if trained.'
        }
      ],
      warnings: [
        'Never induce vomiting unless specifically told to do so by poison control or a healthcare professional.',
        'Do not give anything by mouth (food, drink, medication) to an unconscious person.',
        'Do not try to neutralize a poison with another substance unless directed by poison control.'
      ],
      videoLink: 'https://example.com/poisoning-response'
    },
    {
      id: 'seizure',
      title: 'Seizures',
      category: 'medical',
      urgency: 'high',
      icon: '⚡',
      shortDescription: 'How to provide first aid during a seizure.',
      overview: 'Seizures are sudden, uncontrolled electrical disturbances in the brain. They can cause changes in behavior, movements, feelings, and levels of consciousness. Most seizures last from 30 seconds to 2 minutes and dont cause lasting harm.',
      steps: [
        {
          title: 'Help the person safely to the ground',
          description: 'If the person is standing or sitting when the seizure begins, help them to the ground to prevent falling injuries.'
        },
        {
          title: 'Move hazards away',
          description: 'Clear away furniture or other objects that might cause injury during the seizure.'
        },
        {
          title: 'Cushion the head',
          description: 'Place something soft and flat, like a folded jacket, under the persons head to prevent head injury.'
        },
        {
          title: 'Position the person on their side',
          description: 'If possible, gently roll the person onto their side to help keep the airway clear and prevent choking on saliva or vomit.'
        },
        {
          title: 'Time the seizure',
          description: 'Note when the seizure started and how long it lasts. If it continues for more than 5 minutes, call emergency services if you have not already.'
        },
        {
          title: 'Stay with the person until they recover',
          description: 'After the seizure, the person may be confused or drowsy. Stay with them until they are fully conscious and aware of their surroundings.'
        },
        {
          title: 'Check for a medical ID',
          description: 'Look for a medical alert bracelet or other emergency information about the persons condition.'
        }
      ],
      warnings: [
        'Do not hold the person down or try to stop their movements.',
        'Do not put anything in the persons mouth, including medication or fluids, as this can cause choking.',
        'Do not give the person food or water until they are fully alert and can swallow safely.'
      ],
      videoLink: 'https://example.com/seizure-first-aid',
      callEmergencyIf: [
        'The seizure lasts longer than 5 minutes',
        'The person does not wake up after the seizure stops',
        'Another seizure starts soon after the first',
        'The person has difficulty breathing',
        'The person is injured during the seizure',
        'The seizure occurs in water',
        'The person has a health condition like diabetes or heart disease',
        'The person is pregnant'
      ]
    }
  ];

  // Load saved data on component mount
  useEffect(() => {
    const savedRecent = JSON.parse(localStorage.getItem('recentlyViewedFirstAid')) || [];
    const savedBookmarks = JSON.parse(localStorage.getItem('bookmarkedFirstAid')) || [];
    
    setRecentlyViewed(savedRecent);
    setBookmarkedGuides(savedBookmarks);
  }, []);

  // Save data when changes occur
  useEffect(() => {
    localStorage.setItem('recentlyViewedFirstAid', JSON.stringify(recentlyViewed));
    localStorage.setItem('bookmarkedFirstAid', JSON.stringify(bookmarkedGuides));
  }, [recentlyViewed, bookmarkedGuides]);

  // Function to filter emergency guides
  const getFilteredGuides = () => {
    return emergencyGuides.filter(guide => {
      const matchesCategory = selectedCategory === 'all' || guide.category === selectedCategory;
      const matchesSearch = guide.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           guide.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  };

  // Function to handle viewing an emergency guide
  const viewEmergencyGuide = (guide) => {
    setSelectedEmergency(guide);
    
    // Add to recently viewed if not already there
    setRecentlyViewed(prev => {
      const filteredList = prev.filter(item => item.id !== guide.id);
      return [guide, ...filteredList].slice(0, 5); // Keep only 5 most recent
    });
  };

  // Function to toggle bookmark status
  const toggleBookmark = (guide) => {
    setBookmarkedGuides(prev => {
      if (prev.some(item => item.id === guide.id)) {
        return prev.filter(item => item.id !== guide.id);
      } else {
        return [...prev, guide];
      }
    });
  };

  // Function to check if a guide is bookmarked
  const isBookmarked = (guideId) => {
    return bookmarkedGuides.some(guide => guide.id === guideId);
  };

  // Function to get icon based on urgency level
  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical':
        return <span className="urgency critical">Critical</span>;
      case 'high':
        return <span className="urgency high">High</span>;
      case 'medium':
        return <span className="urgency medium">Medium</span>;
      default:
        return <span className="urgency low">Low</span>;
    }
  };

  // Filtered guides
  const filteredGuides = getFilteredGuides();
  
  return (
    <div className={`feature-container first-aid-guide ${darkMode ? 'dark-mode' : ''}`}>
      {/* Emergency Call Modal */}
      {callModalOpen && (
        <div className="emergency-call-modal">
          <div className="modal-content">
            <h2>Emergency Services</h2>
            <p>In case of a medical emergency, call:</p>
            <a href="tel:108" className="emergency-call-button">Call 108</a>
            <p>Poison Control Center: <a href="tel:18002221222">1-800-222-1222</a></p>
            <button className="close-modal-button" onClick={() => setCallModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
      
      {/* Main Header */}
      <div className="first-aid-header">
        <div className="header-content">
          <h1>First Aid Guide</h1>
          <p>Quick access to emergency first aid instructions</p>
        </div>
        <button className="emergency-button" onClick={() => setCallModalOpen(true)}>
          <span className="emergency-icon">🚨</span>
          Emergency Call
        </button>
      </div>

      {/* Search and Filters */}
      <div className="search-container">
        <div className="search-input">
          <input
            type="text"
            placeholder="Search for emergency instructions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="search-button">Search</button>
        </div>
        
        <div className="category-filters">
          {categories.map(category => (
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
      
      {/* Main Content */}
      <div className="first-aid-content">
        {/* Sidebar */}
        <div className="first-aid-sidebar">
          {/* Quick Access */}
          <div className="quick-access-section">
            <h3>Critical Emergencies</h3>
            <div className="quick-access-buttons">
              {emergencyGuides
                .filter(guide => guide.urgency === 'critical')
                .map(guide => (
                  <button 
                    key={guide.id}
                    className="critical-button"
                    onClick={() => viewEmergencyGuide(guide)}
                  >
                    <span className="emergency-icon">{guide.icon}</span>
                    <span className="emergency-name">{guide.title}</span>
                  </button>
                ))}
            </div>
          </div>
          
          {/* Bookmarked Guides */}
          {bookmarkedGuides.length > 0 && (
            <div className="bookmarked-section">
              <h3>Bookmarked Guides</h3>
              <div className="bookmarked-list">
                {bookmarkedGuides.map(guide => (
                  <div 
                    key={guide.id} 
                    className="bookmark-item"
                    onClick={() => viewEmergencyGuide(guide)}
                  >
                    <span className="bookmark-icon">{guide.icon}</span>
                    <span className="bookmark-name">{guide.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recently Viewed */}
          {recentlyViewed.length > 0 && (
            <div className="recent-section">
              <h3>Recently Viewed</h3>
              <div className="recent-list">
                {recentlyViewed.map(guide => (
                  <div 
                    key={guide.id} 
                    className="recent-item"
                    onClick={() => viewEmergencyGuide(guide)}
                  >
                    <span className="recent-icon">{guide.icon}</span>
                    <span className="recent-name">{guide.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Main Content Area */}
        <div className="first-aid-main">
          {selectedEmergency ? (
            <div className="emergency-details">
              <div className="details-header">
                <button 
                  className="back-button"
                  onClick={() => setSelectedEmergency(null)}
                >
                  ← Back
                </button>
                <button 
                  className={`bookmark-button ${isBookmarked(selectedEmergency.id) ? 'bookmarked' : ''}`}
                  onClick={() => toggleBookmark(selectedEmergency)}
                >
                  {isBookmarked(selectedEmergency.id) ? 'Bookmarked ★' : 'Bookmark ☆'}
                </button>
              </div>
              
              <div className="emergency-title-section">
                <div className="emergency-icon-large">{selectedEmergency.icon}</div>
                <div className="emergency-title-content">
                  <h2>{selectedEmergency.title}</h2>
                  {getUrgencyIcon(selectedEmergency.urgency)}
                </div>
              </div>
              
              <div className="emergency-overview">
                <h3>Overview</h3>
                <p>{selectedEmergency.overview}</p>
              </div>
              
              <div className="emergency-steps">
                <h3>First Aid Steps</h3>
                <div className="steps-list">
                  {selectedEmergency.steps.map((step, index) => (
                    <div className="step-item" key={index}>
                      <div className="step-number">{index + 1}</div>
                      <div className="step-content">
                        <h4>{step.title}</h4>
                        <p>{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedEmergency.warnings && selectedEmergency.warnings.length > 0 && (
                <div className="emergency-warnings">
                  <h3>Important Warnings</h3>
                  <ul className="warnings-list">
                    {selectedEmergency.warnings.map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedEmergency.callEmergencyIf && selectedEmergency.callEmergencyIf.length > 0 && (
                <div className="call-emergency-section">
                  <h3>Call Emergency Services (911) If:</h3>
                  <ul className="call-emergency-list">
                    {selectedEmergency.callEmergencyIf.map((reason, index) => (
                      <li key={index}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedEmergency.videoLink && (
                <div className="emergency-video">
                  <h3>Video Instruction</h3>
                  <p>For visual guidance, watch this instructional video:</p>
                  <a href={selectedEmergency.videoLink} target="_blank" rel="noopener noreferrer" className="video-link">
                    Watch Video Tutorial
                  </a>
                </div>
              )}
            </div>
          ) : (
            <div className="emergency-list">
              <h2>First Aid Guides</h2>
              
              {filteredGuides.length > 0 ? (
                <div className="guides-grid">
                  {filteredGuides.map(guide => (
                    <div 
                      key={guide.id} 
                      className="guide-card"
                      onClick={() => viewEmergencyGuide(guide)}
                    >
                      <div className="guide-header">
                        <div className="guide-icon">{guide.icon}</div>
                        <div className="guide-title-container">
                          <h3>{guide.title}</h3>
                          {getUrgencyIcon(guide.urgency)}
                        </div>
                        <button 
                          className={`small-bookmark ${isBookmarked(guide.id) ? 'active' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleBookmark(guide);
                          }}
                        >
                          {isBookmarked(guide.id) ? '★' : '☆'}
                        </button>
                      </div>
                      <p className="guide-description">{guide.shortDescription}</p>
                      <div className="guide-footer">
                        <span className="category-tag">{categories.find(c => c.id === guide.category)?.name}</span>
                        <button className="view-button">View Guide</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>No first aid guides match your search. Try different keywords or select a different category.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Disclaimer */}
      <div className="first-aid-disclaimer">
        <p><strong>Disclaimer:</strong> This first aid guide is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition or emergency. If you think you may have a medical emergency, call your doctor or emergency services immediately.</p>
      </div>
    </div>
  );
}

export default FirstAidGuide;