// src/components/features/mentalWellness/MentalWellness.js
import React, { useState } from 'react';
import { useTheme } from '../../../contexts/ThemeContext';
import './MentalWellness.css';

function MentalWellness() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('articles');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [moodLog, setMoodLog] = useState([]);
  const [newMoodEntry, setNewMoodEntry] = useState({
    mood: 'neutral',
    intensity: 5,
    notes: '',
    date: new Date().toISOString().split('T')[0]
  });
  const [timerActive, setTimerActive] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300); // 5 minutes in seconds
  const [timerRemaining, setTimerRemaining] = useState(300);
  const [showMoodModal, setShowMoodModal] = useState(false);
  
  // Articles data
  const articles = [
    {
      id: 1,
      title: "Understanding Stress and Its Effects",
      category: "Stress Management",
      excerpt: "Learn about how stress affects your body and mind, and practical ways to manage it in your daily life.",
      readTime: "5 min read",
      image: "stress.jpg",
      content: `
## Understanding Stress and Its Effects

Stress is your body's way of responding to any kind of demand or threat. When you sense danger—whether real or imagined—the body's defenses kick into high gear in a rapid, automatic process known as the "fight-or-flight" reaction or the "stress response."

### How Stress Affects Your Body

The stress response begins in the brain. When you perceive a threat, your amygdala, an area of the brain that contributes to emotional processing, sends a distress signal to your hypothalamus. This area of the brain functions like a command center, communicating with the rest of the body through the nervous system.

Physical effects of stress include:

- Increased heart rate and blood pressure
- Muscle tension
- Rapid breathing
- Release of stress hormones like cortisol and adrenaline
- Digestive issues
- Sleep disturbances

### Psychological Effects of Stress

Stress doesn't just affect your body; it also impacts your mind and emotions:

- Anxiety and worry
- Irritability or anger
- Feeling overwhelmed
- Depression
- Trouble concentrating
- Memory problems

### Healthy Ways to Manage Stress

Managing stress is all about taking charge: of your lifestyle, thoughts, emotions, and the way you deal with problems. Here are some strategies that can help:

1. **Regular physical activity**: Exercise can help reduce stress by releasing endorphins and improving your mood.

2. **Relaxation techniques**: Practices like deep breathing, meditation, yoga, or tai chi can help activate your body's relaxation response.

3. **Healthy eating**: A balanced diet can improve your energy and focus, making you better equipped to handle stress.

4. **Adequate sleep**: Stress can cause sleep problems, and lack of sleep can make stress worse. Aim for 7-9 hours of quality sleep each night.

5. **Social connection**: Talking to friends and family can provide emotional support and help you see problems from a different perspective.

6. **Time management**: Prioritizing tasks, setting boundaries, and taking breaks can help reduce stress related to work or other responsibilities.

7. **Mindfulness**: Being fully present in the moment can help you let go of worries about the past or future.

Remember, managing stress is a journey, not a destination. Be patient with yourself as you explore different strategies and find what works best for you.
      `
    },
    {
      id: 2,
      title: "The Science of Happiness",
      category: "Positive Psychology",
      excerpt: "Discover what science says about happiness and how to increase your sense of wellbeing through simple daily practices.",
      readTime: "8 min read",
      image: "happiness.jpg",
      content: `
## The Science of Happiness

Happiness isn't just a fleeting feeling—it's a state of well-being that encompasses living a good life with a sense of meaning and deep contentment. Scientists have been studying happiness for decades, and their research has revealed fascinating insights about what truly makes us happy.

### What Science Tells Us About Happiness

Contrary to popular belief, happiness isn't determined by our circumstances as much as we might think. Research suggests that:

- About 50% of happiness is determined by genetics
- Only 10% is influenced by circumstances (wealth, health, beauty, etc.)
- 40% is determined by our intentional activities and practices

This means we have significant control over our happiness levels through our daily choices and habits.

### Key Factors That Contribute to Happiness

Research in positive psychology has identified several key components that contribute to lasting happiness:

1. **Positive emotions**: Experiencing joy, gratitude, serenity, interest, hope, pride, amusement, inspiration, awe, and love.

2. **Engagement**: Being completely absorbed in challenging yet enjoyable activities that put you in a state of "flow."

3. **Relationships**: Having strong, supportive social connections is consistently found to be the strongest predictor of happiness.

4. **Meaning**: Having a sense of purpose and feeling that your life matters.

5. **Accomplishment**: Working toward and reaching goals gives us a sense of satisfaction and competence.

### Practices to Increase Happiness

Based on scientific research, here are some evidence-based strategies to boost your happiness:

1. **Practice gratitude**: Regularly noting things you're thankful for has been shown to increase positive emotions and life satisfaction.

2. **Perform acts of kindness**: Helping others not only benefits them but also increases your own happiness.

3. **Nurture relationships**: Invest time and energy in building and maintaining close relationships.

4. **Exercise regularly**: Physical activity releases endorphins and has been shown to reduce depression and anxiety.

5. **Get adequate sleep**: Sleep deprivation negatively affects mood and emotional regulation.

6. **Practice mindfulness meditation**: Regular meditation can decrease stress and increase positive emotions.

7. **Limit social media**: Research suggests that excessive social media use is linked to lower happiness levels.

8. **Spend time in nature**: Even brief exposure to natural environments can improve mood and well-being.

Remember that happiness isn't about feeling good all the time. It's about living a rich, full life that includes the entire range of human emotions, guided by your core values and meaningful pursuits.
      `
    },
    {
      id: 3,
      title: "Building Resilience: Bouncing Back from Setbacks",
      category: "Growth Mindset",
      excerpt: "Learn strategies to develop resilience and navigate life's challenges with greater strength and emotional flexibility.",
      readTime: "6 min read",
      image: "resilience.jpg",
      content: `
## Building Resilience: Bouncing Back from Setbacks

Resilience is the ability to adapt well in the face of adversity, trauma, tragedy, or significant sources of stress. It means "bouncing back" from difficult experiences and growing stronger in the process. Resilience isn't something you're born with—it's something you can build over time.

### Why Resilience Matters

Resilient people still experience stress, emotional upheaval, and suffering, but they have developed ways to:

- Maintain perspective during challenging times
- Protect themselves from the potential negative effects of stressors
- Navigate difficult emotions in healthy ways
- Find meaning in hardship
- Recover more quickly from setbacks

### Characteristics of Resilient People

Research has identified several common traits among highly resilient individuals:

1. **Emotional awareness and regulation**: The ability to recognize and manage emotions effectively.

2. **Optimistic thinking**: Maintaining hope and a positive outlook even during difficulties.

3. **Self-efficacy**: Believing in your ability to handle challenges and influence your situation.

4. **Strong social connections**: Having supportive relationships to rely on during tough times.

5. **Problem-solving skills**: The ability to make plans and take action to address problems.

6. **Adaptability**: Willingness to adjust to change and new circumstances.

### How to Build Resilience

Resilience can be developed through intentional practice:

1. **Cultivate self-awareness**: Pay attention to your thoughts, emotions, and behaviors, especially during stressful situations.

2. **Develop a growth mindset**: View challenges as opportunities to learn and grow rather than insurmountable obstacles.

3. **Practice cognitive reframing**: Challenge negative thought patterns and look for more balanced, constructive perspectives.

4. **Build a support network**: Nurture relationships with family, friends, and community who can provide emotional support.

5. **Take care of your physical health**: Regular exercise, adequate sleep, and good nutrition provide a strong foundation for emotional resilience.

6. **Develop your problem-solving skills**: Break down challenges into manageable steps and focus on what you can control.

7. **Find purpose and meaning**: Connect with your values and engage in activities that give you a sense of purpose.

8. **Practice mindfulness and acceptance**: Acknowledge difficult situations and emotions without judgment.

Remember that building resilience is a journey. Small steps taken consistently over time can lead to significant growth in your ability to navigate life's challenges with greater strength and emotional flexibility.
      `
    },
    {
      id: 4,
      title: "Mindfulness Meditation for Beginners",
      category: "Mindfulness",
      excerpt: "A simple guide to getting started with mindfulness meditation, including basic techniques and common challenges.",
      readTime: "4 min read",
      image: "meditation.jpg",
      content: `
## Mindfulness Meditation for Beginners

Mindfulness meditation is a mental training practice that involves focusing your mind on your experiences (like your own emotions, thoughts, and sensations) in the present moment. The goal isn't to stop thinking or to empty your mind, but rather to pay close attention to your physical sensations, thoughts, and emotions without judgment.

### Benefits of Mindfulness Meditation

Research has shown numerous benefits of regular mindfulness practice:

- Reduced stress and anxiety
- Improved focus and concentration
- Better emotional regulation
- Enhanced self-awareness
- Improved sleep quality
- Decreased rumination (repetitive negative thinking)
- Increased compassion for yourself and others

### Getting Started: Basic Mindfulness Meditation

Here's a simple practice to begin with:

1. **Find a quiet space**: Choose a quiet place where you won't be disturbed.

2. **Set a time limit**: If you're a beginner, start with a short session (5-10 minutes).

3. **Get comfortable**: Sit in a chair or on the floor with your back straight but not stiff. Your hands can rest on your legs or in your lap.

4. **Focus on your breath**: Pay attention to the sensation of your breath as it moves in and out of your body. Notice the feeling of air moving through your nose or mouth, the rising and falling of your belly or chest.

5. **Notice when your mind wanders**: Inevitably, your mind will wander. When you notice this, gently bring your attention back to your breath without judging yourself.

6. **End gently**: When your time is up, slowly lift your gaze or open your eyes. Take a moment to notice how your body feels and observe your thoughts and emotions.

### Common Challenges for Beginners

1. **"I can't stop my thoughts"**: The goal isn't to eliminate thinking but to develop awareness of your thoughts without getting caught up in them.

2. **Physical discomfort**: It's normal to experience discomfort when sitting still. Find a position that's comfortable for you, and know that you can adjust if needed.

3. **Feeling restless or bored**: These feelings are normal. Try to observe them with curiosity rather than judgment.

4. **"I don't have time"**: Even a few minutes of mindfulness can be beneficial. Consider integrating mindfulness into daily activities like walking or eating.

5. **Falling asleep**: If you tend to fall asleep during meditation, try practicing at a time when you're more alert or in a seated position rather than lying down.

### Tips for Building a Regular Practice

- **Start small**: Begin with just a few minutes a day and gradually increase.
- **Be consistent**: Try to practice at the same time each day to build a habit.
- **Use guided meditations**: Apps, videos, or audio recordings can help provide structure.
- **Join a group**: Meditating with others can provide motivation and support.
- **Be patient and kind to yourself**: Progress in meditation isn't linear. Approach it with curiosity rather than judgment.

Remember, mindfulness is a skill that develops over time with regular practice. The most important thing is to begin and to return to your practice even after breaks or setbacks.
      `
    },
    {
      id: 5,
      title: "The Connection Between Physical and Mental Health",
      category: "Holistic Wellness",
      excerpt: "Explore how physical health impacts mental wellbeing and vice versa, with practical tips for supporting both.",
      readTime: "7 min read",
      image: "wellness.jpg",
      content: `
## The Connection Between Physical and Mental Health

The mind and body are not separate entities—they are deeply interconnected systems that constantly influence each other. Understanding this connection can help us take a more holistic approach to health and wellness.

### How Physical Health Affects Mental Wellbeing

Our physical health can significantly impact our mental state in several ways:

1. **Exercise and mood**: Physical activity releases endorphins, reduces stress hormones, and stimulates the production of dopamine and serotonin—all chemicals that improve mood and reduce anxiety.

2. **Nutrition and brain function**: The brain requires a steady supply of nutrients to function optimally. Deficiencies in certain vitamins (like B vitamins and vitamin D), minerals, and omega-3 fatty acids have been linked to mental health issues.

3. **Sleep and emotional regulation**: Inadequate sleep can impair cognitive function and emotional regulation, increasing vulnerability to stress, anxiety, and depression.

4. **Chronic illness and mental health**: Managing chronic health conditions often comes with emotional challenges, and some physical conditions directly affect brain function and mental health.

### How Mental Health Affects Physical Wellbeing

Similarly, our mental state can have profound effects on our physical health:

1. **Stress and physical health**: Chronic stress triggers inflammatory responses and hormonal changes that can contribute to heart disease, digestive problems, weakened immune function, and more.

2. **Depression and physical symptoms**: Depression is often accompanied by fatigue, sleep disturbances, appetite changes, and even physical pain.

3. **Anxiety and physical responses**: Anxiety frequently manifests as physical symptoms like muscle tension, rapid heartbeat, shortness of breath, and digestive issues.

4. **Mental health and health behaviors**: Mental health conditions can affect motivation and energy for health-promoting behaviors like exercise, healthy eating, and medical self-care.

### Integrated Approaches to Wellness

Taking care of both mental and physical health together can create positive cycles of wellbeing:

1. **Regular physical activity**: Even moderate exercise can boost mood, reduce anxiety, and improve cognitive function while supporting physical health.

2. **Balanced nutrition**: A diet rich in fruits, vegetables, whole grains, lean protein, and healthy fats supports both brain function and physical health.

3. **Adequate sleep**: Prioritizing good sleep hygiene benefits both mental clarity and physical restoration.

4. **Stress management**: Practices like mindfulness, deep breathing, and progressive muscle relaxation can reduce both psychological stress and physical tension.

5. **Social connection**: Meaningful relationships support mental health and are linked to better physical health outcomes, including longevity.

6. **Mind-body practices**: Activities like yoga, tai chi, and qigong integrate physical movement with mental focus and breath awareness.

7. **Nature exposure**: Spending time in natural environments has been shown to reduce stress hormones, lower blood pressure, and improve mood.

Remember that small changes in either physical or mental health can create positive ripple effects in the other domain. By taking an integrated approach to wellness, you can support your whole self—mind and body together.
      `
    }
  ];
  
  // Relaxation exercises data
  const relaxationExercises = [
    {
      id: 1,
      title: "Deep Breathing Exercise",
      category: "Breathing",
      duration: "5 minutes",
      difficulty: "Beginner",
      benefits: "Reduces stress, lowers heart rate, improves focus",
      instructions: `
## Deep Breathing Exercise

Deep breathing is one of the most effective and accessible ways to activate your body's natural relaxation response. This simple technique can be practiced anywhere, anytime you need to reduce stress or anxiety.

### Benefits

- Activates the parasympathetic nervous system ("rest and digest" mode)
- Lowers heart rate and blood pressure
- Reduces stress hormones
- Improves concentration
- Can help manage pain
- May help manage symptoms of anxiety and depression

### Preparation

1. Find a comfortable position, either sitting with your back supported and feet flat on the floor, or lying down on your back.
2. Place one hand on your chest and the other on your abdomen, just below your ribcage.
3. Close your eyes if it feels comfortable to do so.

### Instructions

1. **Inhale slowly through your nose** for a count of 4, allowing your abdomen to expand and push against your hand. The hand on your chest should remain relatively still.

2. **Hold your breath gently** for a count of 1-2.

3. **Exhale slowly through your mouth** for a count of 6, allowing your abdomen to fall inward. Feel the tension leave your body with each exhale.

4. **Repeat this cycle** for 5 minutes, focusing your attention on the sensation of your breath and the counting.

### Tips for Practice

- If your mind wanders, gently bring your attention back to your breath without judgment.
- Start with just a few minutes and gradually extend your practice time.
- Try to practice at least once daily, especially during periods of stress.
- Some people find it helpful to use a word or phrase with each breath, such as inhaling "peace" and exhaling "tension."
- If you feel lightheaded at any point, return to your normal breathing pattern.

Remember, like any skill, deep breathing becomes more effective with regular practice. Over time, you may notice that you can use just a few deep breaths to quickly shift into a calmer state, even in stressful situations.
      `
    },
    {
      id: 2,
      title: "Progressive Muscle Relaxation",
      category: "Body Scan",
      duration: "15 minutes",
      difficulty: "Beginner",
      benefits: "Releases physical tension, improves body awareness, reduces anxiety",
      instructions: `
## Progressive Muscle Relaxation

Progressive Muscle Relaxation (PMR) is a technique that involves tensing and then releasing different muscle groups throughout your body. This practice helps you recognize the difference between tension and relaxation, making it easier to identify and release physical stress.

### Benefits

- Reduces physical tension and associated pain
- Decreases anxiety and stress
- Improves sleep quality
- Increases awareness of body sensations
- Can help manage conditions like headaches and digestive issues
- Provides a sense of physical and mental calm

### Preparation

1. Find a quiet, comfortable place where you won't be disturbed.
2. Sit in a comfortable chair or lie down on your back.
3. Loosen any tight clothing and remove shoes, glasses, or anything that might restrict movement.
4. Take a few deep breaths to begin relaxing.

### Instructions

For each muscle group:
1. **Tense the muscles** firmly (but not to the point of strain or pain) for 5-7 seconds.
2. **Focus on the sensation of tension**.
3. **Release the tension completely** and quickly.
4. **Focus on the sensation of relaxation** for 15-20 seconds before moving to the next muscle group.

### Muscle Group Sequence

Work through your body in this order:

1. **Hands**: Make fists with both hands.
2. **Wrists and forearms**: Extend your hands and bend them back at the wrists.
3. **Upper arms**: Bend your elbows and tense your biceps.
4. **Shoulders**: Raise your shoulders toward your ears.
5. **Neck**: Gently press your head back against your chair or floor.
6. **Face**: Tense different facial muscles separately:
   - Forehead: Raise your eyebrows
   - Eyes: Close your eyes tightly
   - Jaw: Clench your teeth
   - Mouth: Press your lips together
7. **Chest**: Take a deep breath and hold it while tensing your chest.
8. **Stomach**: Tense your stomach muscles as if preparing for a punch.
9. **Lower back**: Gently arch your back.
10. **Buttocks**: Tighten your buttocks.
11. **Thighs**: Press your thighs together and tighten the muscles.
12. **Calves**: Point your toes toward your head.
13. **Feet**: Curl your toes downward.

After completing the sequence, remain in a relaxed state for a few minutes, enjoying the feeling of relaxation throughout your body.

### Tips for Practice

- For maximum benefit, practice PMR daily, especially when starting out.
- With regular practice, you'll become more aware of tension in your body during daily activities.
- You can perform an abbreviated version by grouping muscles together (upper body, midsection, lower body) when time is limited.
- If you have any injuries or chronic pain, either work very gently with those areas or skip them entirely.
- Some initial muscle soreness is normal when first practicing PMR.

Over time, you may find you can induce relaxation without first tensing your muscles, simply by focusing your attention on releasing tension in each area of your body.
      `
    },
    {
      id: 3,
      title: "Body Scan Meditation",
      category: "Body Scan",
      duration: "10 minutes",
      difficulty: "Beginner",
      benefits: "Increases body awareness, reduces stress, improves mindfulness",
      instructions: `
## Body Scan Meditation

The body scan meditation is a practice that involves systematically bringing attention to different parts of your body, from your toes to the top of your head. This practice helps develop greater awareness of bodily sensations, reduce physical tension, and cultivate mindfulness.

### Benefits

- Increases awareness of the mind-body connection
- Helps identify and release areas of tension
- Promotes deep relaxation
- Improves concentration and mindfulness
- May help with managing chronic pain
- Can improve sleep quality
- Reduces stress and anxiety

### Preparation

1. Find a comfortable position lying on your back, either on a mat, bed, or carpeted floor.
2. You may place a small pillow under your head and/or knees for comfort.
3. Allow your arms to rest at your sides with palms facing up.
4. Close your eyes if that feels comfortable.
5. Take a few deep breaths to settle in.

### Instructions

1. **Begin with awareness of your breath**. Take a few moments to notice the natural rhythm of your breathing without trying to change it.

2. **Bring your attention to your feet**. Notice any sensations in your toes, the soles of your feet, the tops of your feet, and your ankles. Observe any tingling, temperature, tension, or other sensations without judgment.

3. **Slowly move your attention up through your body**, spending time with each area:
   - Calves and shins
   - Knees
   - Thighs
   - Hips and pelvis
   - Lower back
   - Abdomen
   - Chest
   - Upper back and shoulders
   - Arms, wrists, and hands
   - Neck and throat
   - Face (jaw, mouth, nose, eyes, forehead)
   - Back of the head and the top of the head

4. **For each body part**:
   - Notice any sensations present (pressure, tingling, warmth, coolness, tension, ease)
   - If you notice tension, see if you can allow that area to soften
   - If there's no obvious sensation, simply note the absence of sensation
   - Avoid judging what you discover as good or bad

5. **After scanning the entire body**, take a moment to feel your body as a complete whole, from head to toe.

6. **Gradually expand your awareness** to include the room around you, and when you're ready, gently open your eyes.

### Tips for Practice

- If your mind wanders, gently bring your attention back to the body part you were focusing on.
- There's no need to "achieve" anything during the body scan—simply observing with curiosity is the practice.
- If you experience discomfort or strong emotions during the practice, acknowledge them with kindness and continue with the scan.
- Regular practice will deepen the benefits—try practicing daily, even if just for a few minutes.
- You can vary the length of time you spend with each body part based on your available time.
- Some people find it helpful to use a guided body scan recording when starting out.

With consistent practice, the body scan meditation can help you develop a more balanced relationship with bodily sensations and increase your capacity to remain present with your experience moment by moment.
      `
    },
    {
      id: 4,
      title: "5-4-3-2-1 Grounding Technique",
      category: "Grounding",
      duration: "5 minutes",
      difficulty: "Beginner",
      benefits: "Reduces anxiety, counters dissociation, brings awareness to the present",
      instructions: `
## 5-4-3-2-1 Grounding Technique

The 5-4-3-2-1 technique is a powerful grounding exercise that can help manage anxiety, stress, and overwhelming emotions by engaging all five senses. This technique is particularly helpful during moments of acute anxiety, panic attacks, or when feeling disconnected from your surroundings.

### Benefits

- Quickly reduces anxiety and stress
- Helps interrupt racing thoughts or worry spirals
- Brings attention back to the present moment
- Counters dissociation or feelings of unreality
- Can be practiced anywhere, anytime
- Engages multiple senses for effective grounding
- Requires no special equipment or preparation

### Preparation

This technique can be practiced anywhere, in any position. However, for best results:
1. Sit in a comfortable position where you feel secure.
2. Take a few deep breaths to begin.
3. If possible, remove distractions like your phone or other devices.

### Instructions

Work through your five senses in this order:

#### 1. **FIVE things you can SEE**
Look around and name five things you can see in your environment. These can be objects, colors, or details you might not normally notice. Say them either out loud or to yourself: "I see my blue notebook. I see the pattern on the carpet. I see the shadow of the plant. I see the texture of the wall. I see the light reflecting off the window."

#### 2. **FOUR things you can TOUCH/FEEL**
Notice and name four things you can physically feel. This could be the texture of your clothing, the temperature of the air, or the surface you're sitting on. You can actively touch these things if possible: "I feel the smoothness of the table. I feel the softness of my sweater. I feel the coolness of the air on my skin. I feel the weight of my body in the chair."

#### 3. **THREE things you can HEAR**
Listen and identify three sounds in your environment. These might be obvious sounds or subtle ones you don't usually pay attention to: "I hear the ticking of the clock. I hear birds chirping outside. I hear the hum of the refrigerator."

#### 4. **TWO things you can SMELL**
Notice two scents in your environment. If you can't immediately smell anything, you can move to a different location or bring something to your nose (like a piece of fruit, a flower, or even your own hands): "I smell the aroma of coffee. I smell the freshness of the air."

#### 5. **ONE thing you can TASTE**
Identify one thing you can taste right now. This might be the lingering taste of your last meal, a drink, or even just the taste in your mouth. You can also put something small in your mouth specifically for this exercise: "I taste the mint from my tea."

#### 6. **Take a deep breath**
Once you've gone through all five senses, take a deep, centering breath and notice how your body feels now compared to when you started.

### Tips for Practice

- **Go slowly** through each step, really taking time to focus on each sensation.
- **Be specific** in naming what you observe through each sense.
- **Adapt as needed**: If one sense is difficult to engage (e.g., you can't find anything to smell), it's okay to focus more on another sense.
- **Practice regularly**, even when not feeling anxious, to make it easier to use in moments of distress.
- **Personalize** the technique by spending more time with senses you find particularly grounding.

Remember that grounding techniques work best with regular practice. Over time, the 5-4-3-2-1 technique can become a valuable tool in your emotional regulation toolkit, helping you return to the present moment whenever you feel overwhelmed.
      `
    },
    {
      id: 5,
      title: "Loving-Kindness Meditation",
      category: "Meditation",
      duration: "15 minutes",
      difficulty: "Intermediate",
      benefits: "Increases compassion, reduces negative emotions, improves relationships",
      instructions: `
## Loving-Kindness Meditation

Loving-kindness meditation (also known as Metta meditation) is a practice designed to cultivate feelings of goodwill, kindness, and compassion toward yourself and others. This practice helps develop a more positive emotional state and a greater sense of connection with others.

### Benefits

- Increases positive emotions and decreases negative emotions
- Reduces self-criticism and enhances self-compassion
- Improves relationships and social connections
- Decreases symptoms of depression and PTSD
- Reduces chronic pain
- Activates brain areas associated with empathy and emotional regulation
- Reduces implicit bias toward others

### Preparation

1. Find a quiet, comfortable place to sit.
2. Sit in a position that allows you to be both relaxed and alert, with your back reasonably straight.
3. Close your eyes or keep them slightly open with a soft gaze.
4. Take a few deep breaths to center yourself.

### Instructions

The practice involves silently repeating phrases of goodwill, directing them first to yourself and then extending them to others in widening circles:

#### 1. **Begin with yourself**
Start by directing loving-kindness toward yourself. Silently repeat these phrases (or variations that feel meaningful to you):
- "May I be safe and protected."
- "May I be healthy and strong."
- "May I be happy and peaceful."
- "May I live with ease."

As you repeat these phrases, try to genuinely wish these things for yourself. If you notice resistance or difficulty, acknowledge it with kindness and continue with the practice.

#### 2. **A benefactor or loved one**
Next, bring to mind someone who has been kind to you or someone you care about deeply. Direct the same phrases to them:
- "May you be safe and protected."
- "May you be healthy and strong."
- "May you be happy and peaceful."
- "May you live with ease."

Visualize this person and feel your genuine wishes for their wellbeing.

#### 3. **A neutral person**
Think of someone you neither strongly like nor dislike—perhaps someone you see regularly but don't know well, like a grocery store clerk or a neighbor. Direct the same phrases to them.

#### 4. **A difficult person**
If you're ready, bring to mind someone with whom you have difficulty or conflict (start with someone mildly difficult, not the most challenging person in your life). Acknowledging any resistance that arises, direct the same phrases of loving-kindness to them.

#### 5. **All beings**
Finally, extend loving-kindness to all beings everywhere:
- "May all beings be safe and protected."
- "May all beings be healthy and strong."
- "May all beings be happy and peaceful."
- "May all beings live with ease."

You might visualize sending these wishes outward in expanding circles until they encompass the entire planet.

### Tips for Practice

- **Start with a reasonable duration**, perhaps 10-15 minutes, and gradually extend your practice time.
- **Be patient with yourself**. This practice can be challenging, especially when directing loving-kindness toward yourself or difficult people.
- **Use visualization** to enhance the practice. For example, imagine loving-kindness as a warm light radiating from your heart.
- **Adapt the phrases** to make them personally meaningful, but keep them simple and clear.
- **Notice any resistance** without judgment. Simply acknowledge feelings that arise and gently return to the practice.
- **Regular practice** is key. Even short daily sessions can have significant benefits over time.

Remember that loving-kindness meditation is not about forcing particular feelings. It's about setting a sincere intention of goodwill. The feelings often develop naturally with continued practice.
      `
    }
  ];
  
  // Mood scales
  const moodOptions = [
    { value: 'very-negative', label: 'Very Negative', emoji: '😫' },
    { value: 'negative', label: 'Negative', emoji: '😔' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'positive', label: 'Positive', emoji: '🙂' },
    { value: 'very-positive', label: 'Very Positive', emoji: '😁' }
  ];
  
  const intensityLevels = [
    { value: 1, label: 'Very Low' },
    { value: 2, label: 'Low' },
    { value: 3, label: 'Moderate-Low' },
    { value: 4, label: 'Moderate' },
    { value: 5, label: 'Moderate-High' },
    { value: 6, label: 'High' },
    { value: 7, label: 'Very High' }
  ];
  
  // Daily wellness tips
  const wellnessTips = [
    "Take a few minutes for deep breathing exercises several times throughout the day.",
    "Stay hydrated - even mild dehydration can affect your mood and energy levels.",
    "Spend time outdoors - natural light and fresh air can improve your mood and reduce stress.",
    "Practice gratitude by noting three things you're thankful for each day.",
    "Limit social media consumption, especially first thing in the morning and before bed.",
    "Move your body for at least 30 minutes today, even if it's just gentle walking.",
    "Reach out to someone you care about - social connections are vital for mental health.",
    "Try a 5-minute meditation to reset your mind and reduce stress.",
    "Get adequate sleep - aim for 7-9 hours each night for optimal mental health.",
    "Set boundaries with work and digital devices to ensure you have time to recharge."
  ];
  
  // Get random wellness tip
  const getTip = () => {
    const randomIndex = Math.floor(Math.random() * wellnessTips.length);
    return wellnessTips[randomIndex];
  };
  
  // Add mood log entry
  const handleAddMood = (e) => {
    e.preventDefault();
    
    const newEntry = {
      ...newMoodEntry,
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    
    setMoodLog([newEntry, ...moodLog]);
    
    // Reset form
    setNewMoodEntry({
      mood: 'neutral',
      intensity: 5,
      notes: '',
      date: new Date().toISOString().split('T')[0]
    });
    
    setShowMoodModal(false);
  };
  
  // Handle mood entry input changes
  const handleMoodInputChange = (e) => {
    const { name, value } = e.target;
    setNewMoodEntry({
      ...newMoodEntry,
      [name]: value
    });
  };
  
  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  // Handle meditation timer
  const toggleTimer = () => {
    setTimerActive(!timerActive);
  };
  
  // Reset timer
  const resetTimer = () => {
    setTimerActive(false);
    setTimerRemaining(timerDuration);
  };
  
  // Update timer duration
  const handleTimerDurationChange = (duration) => {
    setTimerDuration(duration);
    setTimerRemaining(duration);
  };
  
  // Get mood emoji
  const getMoodEmoji = (mood) => {
    const option = moodOptions.find(option => option.value === mood);
    return option ? option.emoji : '😐';
  };
  
  // Get mood label
  const getMoodLabel = (mood) => {
    const option = moodOptions.find(option => option.value === mood);
    return option ? option.label : 'Neutral';
  };
  
  // Get intensity label
  const getIntensityLabel = (level) => {
    const option = intensityLevels.find(option => option.value === parseInt(level));
    return option ? option.label : 'Moderate';
  };
  
  return (
    <div className={`mental-wellness-container ${darkMode ? 'dark-mode' : ''}`}>
      {/* Mood Tracking Modal */}
      {showMoodModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Log Your Mood</h2>
              <button className="close-button" onClick={() => setShowMoodModal(false)}>×</button>
            </div>
            
            <form onSubmit={handleAddMood} className="mood-form">
              <div className="form-group">
                <label>How are you feeling?</label>
                <div className="mood-options">
                  {moodOptions.map(option => (
                    <div 
                      key={option.value}
                      className={`mood-option ${newMoodEntry.mood === option.value ? 'selected' : ''}`}
                      onClick={() => setNewMoodEntry({...newMoodEntry, mood: option.value})}
                    >
                      <div className="mood-emoji">{option.emoji}</div>
                      <div className="mood-label">{option.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="intensity">Intensity</label>
                <input
                  type="range"
                  id="intensity"
                  name="intensity"
                  min="1"
                  max="7"
                  value={newMoodEntry.intensity}
                  onChange={handleMoodInputChange}
                />
                <div className="range-labels">
                  <span>Very Low</span>
                  <span>Moderate</span>
                  <span>Very High</span>
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={newMoodEntry.date}
                  onChange={handleMoodInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="notes">Notes (optional)</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={newMoodEntry.notes}
                  onChange={handleMoodInputChange}
                  placeholder="What's contributing to your mood today?"
                  rows="3"
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="primary-button">Save Entry</button>
                <button type="button" className="secondary-button" onClick={() => setShowMoodModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Header Section */}
      <div className="mental-wellness-header">
        <div className="header-content">
          <h1>Mental Wellness</h1>
          <p>Resources and tools to support your mental health and emotional wellbeing</p>
        </div>
        <button className="mood-button" onClick={() => setShowMoodModal(true)}>
          <span className="mood-icon">🧠</span>
          Log Mood
        </button>
      </div>
      
      {/* Daily Wellness Tip */}
      <div className="daily-tip-card">
        <div className="tip-icon">💡</div>
        <div className="tip-content">
          <h3>Daily Wellness Tip</h3>
          <p>{getTip()}</p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="tabs">
        <button
          onClick={() => setActiveTab('articles')}
          className={activeTab === 'articles' ? 'active' : ''}
        >
          Articles
        </button>
        <button
          onClick={() => setActiveTab('exercises')}
          className={activeTab === 'exercises' ? 'active' : ''}
        >
          Relaxation Exercises
        </button>
        <button
          onClick={() => setActiveTab('mood-tracking')}
          className={activeTab === 'mood-tracking' ? 'active' : ''}
        >
          Mood Tracking
        </button>
        <button
          onClick={() => setActiveTab('meditation')}
          className={activeTab === 'meditation' ? 'active' : ''}
        >
          Meditation Timer
        </button>
      </div>
      
      {/* Tab content */}
      <div className="tab-content">
        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="articles-tab">
            {selectedArticle ? (
              <div className="article-detail">
                <div className="article-header">
                  <button 
                    className="back-button"
                    onClick={() => setSelectedArticle(null)}
                  >
                    ← Back to Articles
                  </button>
                </div>
                
                <h2 className="article-title">{selectedArticle.title}</h2>
                <div className="article-meta">
                  <span className="article-category">{selectedArticle.category}</span>
                  <span className="article-read-time">{selectedArticle.readTime}</span>
                </div>
                
                <div className="article-content">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: selectedArticle.content
                        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                        .replace(/\n\n/g, '</p><p>')
                        .replace(/\n- (.*$)/gm, '<li>$1</li>')
                        .replace(/<li>/g, '<ul><li>')
                        .replace(/<\/li>\n/g, '</li></ul>')
                        .replace(/<\/ul>\n<ul>/g, '') 
                    }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="articles-list">
                <h2>Wellness Articles</h2>
                <div className="article-categories">
                  <span>Categories: </span>
                  <button className="category-tag active">All</button>
                  <button className="category-tag">Stress Management</button>
                  <button className="category-tag">Mindfulness</button>
                  <button className="category-tag">Positive Psychology</button>
                  <button className="category-tag">Growth Mindset</button>
                  <button className="category-tag">Holistic Wellness</button>
                </div>
                
                <div className="articles-grid">
                  {articles.map(article => (
                    <div 
                      key={article.id}
                      className="article-card"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="article-image-placeholder"></div>
                      <div className="article-card-content">
                        <div className="article-card-category">{article.category}</div>
                        <h3 className="article-card-title">{article.title}</h3>
                        <p className="article-card-excerpt">{article.excerpt}</p>
                        <div className="article-card-footer">
                          <span className="article-read-time">{article.readTime}</span>
                          <button className="read-more-button">Read More</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Relaxation Exercises Tab */}
        {activeTab === 'exercises' && (
          <div className="exercises-tab">
            {selectedExercise ? (
              <div className="exercise-detail">
                <div className="exercise-header">
                  <button 
                    className="back-button"
                    onClick={() => setSelectedExercise(null)}
                  >
                    ← Back to Exercises
                  </button>
                </div>
                
                <h2 className="exercise-title">{selectedExercise.title}</h2>
                <div className="exercise-meta">
                  <span className="exercise-category">{selectedExercise.category}</span>
                  <span className="exercise-duration">{selectedExercise.duration}</span>
                  <span className="exercise-difficulty">{selectedExercise.difficulty}</span>
                </div>
                
                <div className="exercise-benefits">
                  <h3>Benefits</h3>
                  <p>{selectedExercise.benefits}</p>
                </div>
                
                <div className="exercise-content">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: selectedExercise.instructions
                        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
                        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
                        .replace(/\n\n/g, '</p><p>')
                        .replace(/\n- (.*$)/gm, '<li>$1</li>')
                        .replace(/<li>/g, '<ul><li>')
                        .replace(/<\/li>\n/g, '</li></ul>')
                        .replace(/<\/ul>\n<ul>/g, '') 
                    }}
                  ></div>
                </div>
                
                <div className="exercise-actions">
                  <button className="try-exercise-button" onClick={() => setActiveTab('meditation')}>
                    Try with Meditation Timer
                  </button>
                </div>
              </div>
            ) : (
              <div className="exercises-list">
                <h2>Relaxation Exercises</h2>
                <p className="exercises-intro">
                  Explore these evidence-based exercises to reduce stress, calm your mind, and improve your emotional wellbeing.
                </p>
                
                <div className="exercise-categories">
                  <span>Categories: </span>
                  <button className="category-tag active">All</button>
                  <button className="category-tag">Breathing</button>
                  <button className="category-tag">Meditation</button>
                  <button className="category-tag">Body Scan</button>
                  <button className="category-tag">Grounding</button>
                </div>
                
                <div className="exercises-grid">
                  {relaxationExercises.map(exercise => (
                    <div 
                      key={exercise.id}
                      className="exercise-card"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      <div className="exercise-card-header">
                        <div className="exercise-icon">
                          {exercise.category === 'Breathing' ? '🫁' : 
                           exercise.category === 'Meditation' ? '🧘' : 
                           exercise.category === 'Body Scan' ? '👤' : 
                           exercise.category === 'Grounding' ? '🌱' : '🧠'}
                        </div>
                        <div className="exercise-info">
                          <h3 className="exercise-card-title">{exercise.title}</h3>
                          <div className="exercise-card-meta">
                            <span className="exercise-card-duration">{exercise.duration}</span>
                            <span className="exercise-card-level">{exercise.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      <div className="exercise-card-benefits">
                        <p><strong>Benefits:</strong> {exercise.benefits}</p>
                      </div>
                      <button className="view-exercise-button">View Exercise</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Mood Tracking Tab */}
        {activeTab === 'mood-tracking' && (
          <div className="mood-tracking-tab">
            <div className="mood-header">
              <h2>Mood Tracking</h2>
              <button className="add-mood-button" onClick={() => setShowMoodModal(true)}>
                + Log New Entry
              </button>
            </div>
            
            <div className="mood-content">
              <div className="mood-chart-section">
                <h3>Mood History</h3>
                <div className="chart-placeholder">
                  <p>Mood trends visualization would appear here</p>
                  <p>Track your mood regularly to see patterns over time</p>
                </div>
              </div>
              
              <div className="mood-log-section">
                <h3>Recent Entries</h3>
                
                {moodLog.length > 0 ? (
                  <div className="mood-entries">
                    {moodLog.map(entry => (
                      <div key={entry.id} className="mood-entry-card">
                        <div className="mood-entry-header">
                          <div className="mood-entry-emoji">{getMoodEmoji(entry.mood)}</div>
                          <div className="mood-entry-info">
                            <div className="mood-entry-type">
                              {getMoodLabel(entry.mood)} - {getIntensityLabel(entry.intensity)} Intensity
                            </div>
                            <div className="mood-entry-date">
                              {new Date(entry.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        
                        {entry.notes && (
                          <div className="mood-entry-notes">
                            {entry.notes}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-entries-message">
                    <p>No mood entries yet. Start tracking your mood to see your entries here.</p>
                    <button className="primary-button" onClick={() => setShowMoodModal(true)}>
                      Log Your First Mood
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mood-tracking-benefits">
              <h3>Benefits of Mood Tracking</h3>
              <div className="benefits-grid">
                <div className="benefit-card">
                  <div className="benefit-icon">🔍</div>
                  <h4>Identify Patterns</h4>
                  <p>Discover connections between your activities, environment, and emotional state.</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">📈</div>
                  <h4>Track Progress</h4>
                  <p>Monitor improvements in your mental wellbeing over time.</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">🧠</div>
                  <h4>Increase Self-Awareness</h4>
                  <p>Develop greater understanding of your emotional responses and triggers.</p>
                </div>
                <div className="benefit-card">
                  <div className="benefit-icon">💬</div>
                  <h4>Improve Communication</h4>
                  <p>Better articulate your emotional experiences to healthcare providers or loved ones.</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Meditation Timer Tab */}
        {activeTab === 'meditation' && (
          <div className="meditation-tab">
            <h2>Meditation Timer</h2>
            <p className="meditation-intro">
              Use this timer to guide your meditation or relaxation practice. Choose a duration, start the timer, and focus on your practice.
            </p>
            
            <div className="meditation-timer">
              <div className="timer-display">
                <div className="timer-circle">
                  <div className="timer-time">{formatTime(timerRemaining)}</div>
                </div>
              </div>
              
              <div className="timer-controls">
                <div className="duration-buttons">
                  <button onClick={() => handleTimerDurationChange(60)} className={timerDuration === 60 ? 'active' : ''}>1m</button>
                  <button onClick={() => handleTimerDurationChange(300)} className={timerDuration === 300 ? 'active' : ''}>5m</button>
                  <button onClick={() => handleTimerDurationChange(600)} className={timerDuration === 600 ? 'active' : ''}>10m</button>
                  <button onClick={() => handleTimerDurationChange(900)} className={timerDuration === 900 ? 'active' : ''}>15m</button>
                  <button onClick={() => handleTimerDurationChange(1200)} className={timerDuration === 1200 ? 'active' : ''}>20m</button>
                </div>
                
                <div className="timer-buttons">
                  <button className="timer-button" onClick={toggleTimer}>
                    {timerActive ? 'Pause' : 'Start'}
                  </button>
                  <button className="timer-button reset" onClick={resetTimer}>
                    Reset
                  </button>
                </div>
              </div>
            </div>
            
            <div className="meditation-guidance">
              <h3>Quick Meditation Guide</h3>
              <div className="meditation-steps">
                <div className="meditation-step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Find a comfortable position</h4>
                    <p>Sit or lie down in a position that allows you to be relaxed but alert.</p>
                  </div>
                </div>
                <div className="meditation-step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Focus on your breathing</h4>
                    <p>Notice the sensation of your breath as you inhale and exhale naturally.</p>
                  </div>
                </div>
                <div className="meditation-step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Acknowledge wandering thoughts</h4>
                    <p>When your mind wanders, gently bring your attention back to your breath.</p>
                  </div>
                </div>
                <div className="meditation-step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Continue for your chosen duration</h4>
                    <p>Practice regularly to experience the benefits of meditation.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="recommended-meditations">
              <h3>Try These Guided Meditations</h3>
              <div className="meditation-recommendations">
                <div className="recommended-meditation">
                  <h4>Breathing Awareness</h4>
                  <p>A simple meditation focusing on the breath, perfect for beginners.</p>
                  <div className="recommendation-duration">5 minutes</div>
                </div>
                <div className="recommended-meditation">
                  <h4>Body Scan Relaxation</h4>
                  <p>Systematically release tension throughout your body.</p>
                  <div className="recommendation-duration">10 minutes</div>
                </div>
                <div className="recommended-meditation">
                  <h4>Loving-Kindness Practice</h4>
                  <p>Cultivate compassion for yourself and others.</p>
                  <div className="recommendation-duration">15 minutes</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Disclaimer */}
      <div className="mental-wellness-disclaimer">
        <p><strong>Disclaimer:</strong> The resources provided in this Mental Wellness section are for informational and self-help purposes only. They are not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified healthcare provider with any questions you may have regarding a medical condition or mental health concern.</p>
      </div>
    </div>
  );
}

export default MentalWellness;