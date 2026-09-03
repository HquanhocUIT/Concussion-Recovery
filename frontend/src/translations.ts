export const translations: Record<string, any> = {
  en: {
    appName: "ConcussionRecovery",
    nav: {
      signIn: "Sign In",
      getStarted: "Get Started",
      about: "About Us"
    },
    // Hero
    hero: {
      badge: "AI-POWERED RECOVERY PLANNING",
      title1: "Plan Your Safe Return",
      title2: "After a Concussion",
      subtitle: "RE:ENTRY helps you understand today's symptoms and simulate a safe Recovery Load, so you know how much school, work, or exercise your brain can handle right now.",
      btnStart: "Start Daily Check-in",
      btnWatch: "See how it works",
      statsExpert: "CLINICALLY INFORMED GUIDANCE",
      statsAnon: "100% ANONYMOUS CHECK-INS",
      statsCampus: "50+ CLINIC PARTNERS",
      cardTitle: "TODAY'S RECOVERY LOAD",
      cardText: "Your tolerance for daily activity has improved by 22% this week."
    },
    // Footer
    footer: {
      desc: "Supporting safe concussion recovery, one day at a time.",
      privacy: "Privacy Policy",
      ethics: "Research Ethics",
      partners: "Clinic Partners",
      careers: "Careers"
    },
    // How It Works Modal
    howItWorks: {
      title: "How RE:ENTRY Understands You",
      intro: "The AI analyzes today's symptoms, sleep, cognitive load, and mood to simulate how much activity your brain can safely handle right now.",
      pillar1Title: "Objective & Unbiased",
      pillar1Text: "By removing personal bias, our system evaluates your Recovery Load purely on your daily check-in data, not assumptions.",
      pillar2Title: "Comprehensive Analysis",
      pillar2Text: "We analyze symptoms, sleep, cognitive load, and mood to identify what's really slowing your recovery down, not just the surface symptoms.",
      pillar3Title: "Anonymous Analysis",
      pillar3Text: "100% anonymous processing ensures your sensitive data is never stored, shared, or used for commercial purposes.",
      reliability: "This tool is a decision-support aid, not a diagnostic device.",
      processTitle: "How the Process Works:",
      flowStep1: "Daily Check-in",
      flowStep2: "AI Recovery Load Simulation",
      flowStep3: "Personalized Activity Plan",
      close: "Close"
    },
    // Consent
    consent: {
      title: "Informed Consent & Privacy",
      welcome: "Welcome to ConcussionRecovery. Before starting, please read these terms carefully:",
      h1: "1. Purpose of This Check-in",
      p1: "This daily check-in collects information about your current symptoms, sleep, cognitive load, and activity levels so the AI can estimate a safe Recovery Load and suggest a personalized return-to-activity plan.",
      h2: "2. Privacy & Anonymity",
      p2: "All data is collected completely anonymously. We do not require your name, email, or any personal identifiers. Data is only used for your personal analysis during this session.",
      h3: "3. Limitations of This Tool",
      p3: "ConcussionRecovery is an AI decision-support tool that helps you plan a safer return to school, work, and exercise after a concussion. It does not replace medical diagnosis or professional care — always follow guidance from your doctor or care team.",
      btnDecline: "Decline & Go Back",
      btnAccept: "I Agree & Start"
    },
    motivational: {
      quote: "Recovering from a concussion is not a straight line, and that's okay. Every day you check in and listen to your body is a step forward. You don't have to push through it alone — pace yourself, rest when you need to, and trust that steady, gradual progress is still progress.",
      next: "Next"
    },
    survey: {
      step: "Step",
      completed: "Completed",
      btnPrev: "Previous",
      btnNext: "Next",
      btnSubmit: "Complete & Analyze",
      analyzingTitle: "Analyzing Your Check-in...",
      analyzingDesc: "Our AI is estimating your Recovery Load and generating a personalized activity plan for you.",
      errors: {
        invalidAge: "Please enter a valid age (10-100).",
        selectGender: "Please select your gender."
      }
    },
    // Questions (Steps 1-5) — Daily Check-in for concussion recovery
    questions: {
      s1Title: "Step 1: Basic Info",

      q1: "1. What is your current age?",
      q2: "2. What is your gender?",
      genderMale: "Male",
      genderFemale: "Female",
      genderOther: "Other",
      q3: "3. How many days since your injury?",

      s2Title: "Step 2: Today's Symptoms",
      q4: "4. Headache severity today (0 = None, 5 = Severe)?",
      q5: "5. Dizziness severity today (0 = None, 5 = Severe)?",
      q6: "6. Blurred vision severity today (0 = None, 5 = Severe)?",
      q7: "7. Nausea severity today (0 = None, 5 = Severe)?",

      s3Title: "Step 3: Physical",
      q8: "8. Sleep quality last night (0 = Worst, 5 = Best)?",
      q9: "9. Did your symptoms get worse after activity today?",
      q10: "10. Screen time today (0 = None, 5 = Very heavy)?",

      s4Title: "Step 4: Cognitive Load",
      q11: "11. Study or work hours today (0 = None, 5 = Very heavy)?",
      q12: "12. Difficulty reading or concentrating today (0 = None, 5 = Severe)?",
      q13: "13. How would you rate your mood today (0 = Very low, 5 = Great)?",

      yes: "Yes",
      no: "No",
    },
    // Results & Emergency
    results: {
      gaugeTitle: "Current Recovery Load Level:",
      gaugeConf: "Confidence:",
      low: "LOW",
      medium: "MEDIUM",
      high: "HIGH",
      featureTitle: "Feature Importance - Current Check-in",
      recsTitle: "Action Cards",
      historyTitle: "Your Check-in History",
      actionCards: {
        sleepTitle: "Prioritize restorative sleep",
        sleepDesc: "Sleep quality is {score}/5. Aim for consistent, sufficient sleep and reduce screens 60 minutes before bed to support recovery.",
        sleepSteps: [
          "Set a fixed bedtime and wake time, even on weekends.",
          "Avoid screens for at least 45 minutes before sleep.",
          "Keep your room cool, dark, and quiet.",
          "Try 5 minutes of slow breathing before lights out."
        ],
        studyLoadTitle: "Reduce screen time today",
        studyLoadDesc: "Screen time is {score}/5. Break up screen use with frequent short breaks to avoid triggering symptoms.",
        studyLoadSteps: [
          "Use the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds.",
          "Lower screen brightness and increase text size.",
          "Take a 10-minute screen-free break every 30-45 minutes.",
          "Avoid screens for at least an hour before bed."
        ],
        studyFocusTitle: "Ease back into study or work",
        studyFocusDesc: "Concentration difficulty is {score}/5. Shorten work sessions and build back up gradually as tolerated.",
        studyFocusSteps: [
          "Work in short 20-25 minute blocks with breaks in between.",
          "Tackle the most demanding tasks earlier in the day.",
          "Ask for extra time or reduced workload if needed.",
          "Stop an activity as soon as symptoms start to increase."
        ],
        anxietyTitle: "Ease acute symptoms",
        anxietyDesc: "Symptom severity is {score}/5. Rest in a quiet, dim space and avoid pushing through discomfort.",
        anxietySteps: [
          "Rest in a quiet, low-light room until symptoms ease.",
          "Avoid intense physical or cognitive activity for now.",
          "Stay hydrated and avoid caffeine or alcohol.",
          "Contact your care team if symptoms escalate quickly."
        ],
        moodTitle: "Support your mood",
        moodDesc: "Mood score is {score}/5. Gentle activity and connection with others can help stabilize your mood during recovery.",
        moodSteps: [
          "Spend 10-15 minutes outside in natural light if tolerated.",
          "Check in with a friend or family member you trust.",
          "Do a low-effort, enjoyable activity (music, drawing, a short walk).",
          "If your mood stays low for several days, talk to your care team."
        ],
        supportTitle: "Lean on your support network",
        supportDesc: "Social support is {score}/3. Let someone close to you know how you're doing today.",
        supportSteps: [
          "Message someone you trust and share how you're feeling.",
          "Ask a friend or family member to help with a task today.",
          "Share your recovery plan with someone who can check in on you.",
          "Don't hesitate to ask for specific help when you need it."
        ],
        peerTitle: "Watch for activity-triggered symptoms",
        peerDesc: "Your symptoms worsened after activity today. Scale back intensity and reintroduce activity more gradually.",
        peerSteps: [
          "Stop the activity as soon as symptoms increase.",
          "Rest for 24 hours before trying that activity level again.",
          "Reintroduce activity at a lower intensity next time.",
          "Track which activities trigger symptoms to plan around them."
        ],
        bullyingTitle: "Pace your work or study hours",
        bullyingDesc: "Work/study hours are {score}/5. Long unbroken sessions can slow recovery — build in structured breaks.",
        bullyingSteps: [
          "Break your day into shorter work blocks with rest between.",
          "Communicate with school or work about a modified schedule.",
          "Prioritize only the most essential tasks for now.",
          "Track your symptom response and adjust your hours accordingly."
        ],
        activityTitle: "Add gentle movement",
        activityDesc: "You didn't exercise today. Light, symptom-guided movement can support recovery when cleared by your care team.",
        activitySteps: [
          "Try a short, easy walk if you feel up to it.",
          "Stop immediately if any symptoms appear or worsen.",
          "Avoid contact sports or high-intensity exercise until cleared.",
          "Check with your care team before resuming your usual activity level."
        ],
        needsTitle: "Manage today's overwhelm",
        needsDesc: "Stress/overwhelm level is {score}/5. Simplify your day and focus only on what's essential.",
        needsSteps: [
          "Write down just 1-3 essential tasks for today.",
          "Delegate or postpone anything that isn't urgent.",
          "Build in short rest breaks throughout the day.",
          "Ask for support from family, friends, school, or work."
        ],
        reliefTitle: "Ease physical symptoms",
        reliefDesc: "Symptom severity is {score}/5. Rest, hydration, and a calm environment can help ease discomfort.",
        reliefSteps: [
          "Rest in a quiet, dimly lit room.",
          "Drink water regularly throughout the day.",
          "Apply a cool compress to your head or neck if it helps.",
          "Track symptom frequency and severity to share with your care team."
        ],
        topDriverTitle: "Focus on your top factor",
        topDriverDesc: "Top factor: {feature} ({pct}%). Focus on one small, manageable step for this area today.",
        topDriverSteps: [
          "Look closely at why this factor is affecting you most today.",
          "Spend a little focused time addressing just this one area.",
          "Ask your care team for guidance specific to this factor.",
          "Set a small, realistic goal to improve it gradually."
        ],
        highStressTitle: "Prioritize recovery for the next 72 hours",
        highStressDesc: "Your Recovery Load is high. Scale back school, work, screens, and exercise, and rest more over the next few days.",
        highStressSteps: [
          "Request reduced school or work hours for the next few days.",
          "Limit screens and other cognitive load as much as possible.",
          "Avoid physical exertion until symptoms settle.",
          "Contact your doctor or care team to review your symptoms."
        ],
        breatheTitle: "Slow breathing reset",
        breatheDesc: "Try slow, calm breathing for 3-5 minutes to ease tension.",
        breatheSteps: [
          "Sit comfortably with your back straight.",
          "Breathe in slowly through your nose for 4 seconds.",
          "Hold your breath gently for 4 seconds.",
          "Exhale slowly through your mouth for 6 seconds."
        ],
        breaksTitle: "Take intentional breaks",
        breaksDesc: "For every 30-45 minutes of activity, take a 5-10 minute rest break.",
        breaksSteps: [
          "Step away from your task when it's break time.",
          "Look at something calm and distant, like outside a window.",
          "Drink some water or have a light snack.",
          "Avoid screens during this break."
        ],
        connectTitle: "Reach out to someone",
        connectDesc: "Message a friend, family member, or care provider to share how you're doing today.",
        connectSteps: [
          "Choose someone you feel comfortable talking to.",
          "Start with a simple check-in message.",
          "Be honest about how you're feeling today.",
          "Accept support, advice, or simply someone listening."
        ],
        hydrateTitle: "Stay hydrated",
        hydrateDesc: "Drink water regularly throughout the day and limit caffeine, especially later in the day.",
        hydrateSteps: [
          "Keep a water bottle within reach.",
          "Set reminders to drink water regularly.",
          "Swap sugary or caffeinated drinks for water when you can.",
          "Avoid heavy fluid intake right before bed."
        ],
        weekPlanTitle: "Plan your week",
        weekPlanDesc: "Pick your top 3 priorities for the week and set realistic time blocks for each.",
        weekPlanSteps: [
          "Use a notebook or calendar app to plan your days.",
          "Block out fixed times for rest and recovery activities.",
          "Leave open, unscheduled time for yourself.",
          "Limit yourself to at most 3 important tasks per day."
        ]
      },
      insightTitle: "Check-in summary",
      trendsTitle: "Key Trends",
      trendsDesc: "Summarize 2-3 main trends from today's check-in (up/down, notable changes).",
      touchpointsTitle: "Critical Touchpoints",
      touchpointsDesc: "Highlight the factors that most influence your current Recovery Load (drivers, barriers, expectations).",
      disclaimer: "These AI results do not replace a professional medical diagnosis. ConcussionRecovery is a decision-support tool for preliminary planning only — always follow guidance from your doctor or care team, especially if symptoms are severe or worsening.",
      consentConfirmed: "Informed Consent confirmed.",
      btnHome: "Return to Home",
      errorTitle: "An Error Occurred",
      errorDesc: "Unable to analyze data at this time. Please try again later.",
      saveRec: "Save action"
    },
    emergency: {
      title: "Safety Alert",
      desc: "You reported one or more concussion warning signs. Planning recommendations have stopped. Please seek immediate medical evaluation.",
      hotlineLabel: "24/7 Concussion Support Line",
      btnCall: "Call Now",
      clinic: "Or contact your care team or nearest urgent care / emergency department if symptoms are severe (e.g. worsening headache, repeated vomiting, confusion, or loss of consciousness).",
      btnUnderstand: "I understand and will seek help"
    },
    legal: {
      close: "Close",
      privacy: {
        title: "Privacy Policy",
        a1h: "Anonymization Principles",
        a1p: "The system does not collect personal identifiers such as full name, email, phone number, or IP address.",
        a2h: "Data Encryption",
        a2p: "All responses are encrypted before storage. Session IDs are random and not tied to real identities.",
        a3h: "Technical Security",
        a3p: "All communication is protected through HTTPS. Administrative access is strictly controlled with JWT.",
        a4h: "Retention Limits",
        a4p: "Data is used only for the purpose of improving your personalized recovery plan and is deleted within 3 months after project completion.",
        a5h: "Aggregated Reporting",
        a5p: "Statistical outputs are shown only in aggregated form to prevent re-identification of any individual."
      },
      ethics: {
        title: "Research Ethics",
        a1h: "Voluntary Participation",
        a1p: "Participation is fully voluntary. You may stop or leave the system at any time.",
        a2h: "Diagnostic Limitation",
        a2p: "ConcussionRecovery is a decision-support tool and does not replace medical diagnosis or professional treatment.",
        a3h: "User Safety First",
        a3p: "When a High Recovery Load is detected, the system must display emergency support resources and a 24/7 hotline (1800 599 920).",
        a4h: "Neutral Language Use",
        a4p: "The platform uses neutral, non-alarming wording to avoid unnecessary anxiety or stigma.",
        a5h: "Transparent Limitations",
        a5p: "We disclose the tool's limitations to maintain honesty and objectivity."
      }
    },
    ui: {
      confidenceInterval: "Confidence Interval",
      details: "Details",
      predictionOutput: "Prediction output",
      languageSwitcher: "Switch language",
      noStepsAvailable: "Steps coming soon...",
      backToDashboard: "Back to Dashboard",
      toAnalytics: "View Analytics",
      dataModule: "Data Module",
      module: { dashboard: "Dashboard", analytics: "Analytics" },
      toggleDarkMode: "Toggle dark mode",
      live: "LIVE",
      weekly: "Weekly",
      monthly: "Monthly",
      campusAvg: "Typical Recovery",
      yourStress: "Your Recovery Load",
      highStress: "High Recovery Load",
      you: "You",
      day: "Day",
      noData: "No data",
      lowStress: "Low recovery load",
      mediumStress: "Medium recovery load",
      trend: "Trend",
      stable: "Stable",
      baseline: "Baseline",
      impact: "Impact",
      impactFactors: "Impact Factors",
      impactFactorsDesc: "Primary drivers of your current Recovery Load",
      prominentTrends: "Prominent Trends",
      prominentTrendsFallback: "Recovery Load patterns tracked from your check-in data.",
      criticalTouchpoints: "Critical Touchpoints",
      recommendedActions: "Recommended Actions",
      recommendedActionsDesc: "Curated steps based on your unique recovery profile today.",
      showLess: "Show less",
      showMore: "Show {count} more",
      anonymousHistoryDesc: "Your anonymous check-in history for this session.",
      viewFullLog: "View full log",
      status: { title: "Status", good: "Good", fair: "Fair", needsAttention: "Needs Attention" },
      dashboard: {
        title: "Recovery Dashboard",
        subtitle: "Your concussion recovery story, visualized through the lens of data.",
        period: "April 2026",
        lifeBalance: "Recovery Overview",
        lifeBalanceDesc: "Your current recovery status based on your latest check-in.",
        stressTrend: "Recovery Load Trend",
        stressTrendDesc: "Your Recovery Load over time vs. a typical recovery pace",
        moodCalendar: "Symptom Calendar",
        peerComparison: "Recovery Benchmark",
        peerComparisonDesc: "How today's numbers compare to a typical recovery pace"
      },
      resultsPanel: {
        title: "Recovery Analysis and Activity Plan",
        subtitle: "An overview of your cognitive load and Recovery Load vectors.",
        last30Days: "Last 30 Days",
        stressLoad: "Recovery Load",
        stressLoadDesc: "Real-time simulation from today's check-in"
      },
      calendar: { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" },
      auth: {
        signInTitle: "Sign In",
        signInSubtitle: "To keep connected with us please login with your personal info",
        signUpTitle: "Create Account",
        signUpSubtitle: "Register with your personal details to use all of site features",
        emailPlaceholder: "Email",
        passwordPlaceholder: "Password",
        namePlaceholder: "Name",
        signInBtn: "Sign In",
        signUpBtn: "Sign Up",
        demoNotice: "Use demo/demo1 to sign in",
        errorInvalid: "Invalid credentials. Try demo/demo1",
        fillAll: "Please fill in all information to register.",
        welcomeBack: "Welcome Back!",
        helloFriend: "Hello, Friend!"
      }
    },
    about: {
      title: "About Us",
      placeholder: "Content coming soon.",
      btnBack: "Close"
    }
  }
};
