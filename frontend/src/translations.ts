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
  },

  vi: {
    appName: "ConcussionRecovery",
    nav: {
      signIn: "Đăng nhập",
      getStarted: "Bắt đầu",
      about: "Về chúng tôi"
    },
    // Hero
    hero: {
      badge: "LẬP KẾ HOẠCH PHỤC HỒI BẰNG AI",
      title1: "Lên kế hoạch trở lại an toàn",
      title2: "Sau chấn động não",
      subtitle: "RE:ENTRY giúp bạn hiểu các triệu chứng hôm nay và mô phỏng Mức Tải Phục Hồi an toàn, để biết não bộ của bạn có thể chịu được bao nhiêu hoạt động học tập, làm việc hoặc thể thao ngay lúc này.",
      btnStart: "Bắt đầu Check-in hôm nay",
      btnWatch: "Xem cách hoạt động",
      statsExpert: "HƯỚNG DẪN DỰA TRÊN Y KHOA",
      statsAnon: "CHECK-IN ẨN DANH 100%",
      statsCampus: "50+ PHÒNG KHÁM ĐỐI TÁC",
      cardTitle: "MỨC TẢI PHỤC HỒI HÔM NAY",
      cardText: "Khả năng chịu tải hoạt động hàng ngày của bạn đã cải thiện 22% tuần này."
    },
    // Footer
    footer: {
      desc: "Đồng hành an toàn trên hành trình phục hồi sau chấn động não.",
      privacy: "Chính sách Bảo mật",
      ethics: "Đạo đức Nghiên cứu",
      partners: "Đối tác Phòng khám",
      careers: "Tuyển dụng"
    },
    // How It Works Modal
    howItWorks: {
      title: "RE:ENTRY thấu hiểu bạn như thế nào",
      intro: "AI phân tích triệu chứng hôm nay, giấc ngủ, tải nhận thức và tâm trạng để mô phỏng mức độ hoạt động an toàn mà não bộ của bạn có thể chịu được lúc này.",
      pillar1Title: "Khách quan & Không định kiến",
      pillar1Text: "Bằng cách loại bỏ định kiến cá nhân, hệ thống đánh giá Mức Tải Phục Hồi của bạn hoàn toàn dựa trên dữ liệu check-in hàng ngày, không dựa trên giả định.",
      pillar2Title: "Phân tích Toàn diện",
      pillar2Text: "Chúng tôi phân tích triệu chứng, giấc ngủ, tải nhận thức và tâm trạng để xác định điều gì thực sự đang làm chậm quá trình phục hồi của bạn.",
      pillar3Title: "Phân tích Ẩn danh",
      pillar3Text: "Xử lý ẩn danh 100% đảm bảo dữ liệu nhạy cảm của bạn không bao giờ bị lưu trữ, chia sẻ hoặc sử dụng cho mục đích thương mại.",
      reliability: "Đây là công cụ hỗ trợ ra quyết định, không phải thiết bị chẩn đoán y khoa.",
      processTitle: "Quy trình hoạt động:",
      flowStep1: "Check-in hàng ngày",
      flowStep2: "AI mô phỏng Mức Tải Phục Hồi",
      flowStep3: "Kế hoạch hoạt động cá nhân hóa",
      close: "Đóng"
    },
    // Consent
    consent: {
      title: "Đồng ý Tham gia & Quyền riêng tư",
      welcome: "Chào mừng bạn đến với ConcussionRecovery. Trước khi bắt đầu, vui lòng đọc kỹ các điều khoản sau:",
      h1: "1. Mục đích của Check-in này",
      p1: "Check-in hàng ngày này thu thập thông tin về triệu chứng hiện tại, giấc ngủ, tải nhận thức và mức độ hoạt động của bạn để AI có thể ước tính Mức Tải Phục Hồi an toàn và đề xuất kế hoạch trở lại hoạt động cá nhân hóa.",
      h2: "2. Bảo mật & Ẩn danh",
      p2: "Tất cả dữ liệu của bạn được thu thập hoàn toàn ẩn danh. Chúng tôi không yêu cầu tên, email hay bất kỳ thông tin định danh cá nhân nào. Dữ liệu chỉ được sử dụng cho mục đích phân tích cá nhân của bạn trong phiên làm việc này.",
      h3: "3. Giới hạn của công cụ này",
      p3: "ConcussionRecovery là công cụ hỗ trợ ra quyết định bằng AI, giúp bạn lên kế hoạch trở lại an toàn với việc học, công việc và thể thao sau chấn động não. Công cụ này không thay thế chẩn đoán y khoa hoặc chăm sóc chuyên môn — luôn tuân theo hướng dẫn từ bác sĩ hoặc đội ngũ chăm sóc của bạn.",
      btnDecline: "Từ chối & Quay lại",
      btnAccept: "Tôi đồng ý & Bắt đầu"
    },
    motivational: {
      quote: "Phục hồi sau chấn động não không phải là một đường thẳng, và điều đó hoàn toàn bình thường. Mỗi ngày bạn check-in và lắng nghe cơ thể mình là một bước tiến. Bạn không cần phải cố gắng vượt qua một mình — hãy đi theo nhịp độ của bản thân, nghỉ ngơi khi cần, và tin rằng tiến bộ chậm mà chắc vẫn là tiến bộ.",
      next: "Tiếp tục"
    },
    survey: {
      step: "Bước",
      completed: "Hoàn thành",
      btnPrev: "Quay lại",
      btnNext: "Tiếp tục",
      btnSubmit: "Hoàn thành & Phân tích",
      analyzingTitle: "Đang phân tích Check-in của bạn...",
      analyzingDesc: "Hệ thống AI đang ước tính Mức Tải Phục Hồi và tạo kế hoạch hoạt động cá nhân hóa cho bạn.",
      errors: {
        invalidAge: "Vui lòng nhập tuổi hợp lệ (10-100).",
        selectGender: "Vui lòng chọn giới tính."
      }
    },
    // Questions (Steps 1-5) — Check-in hàng ngày cho phục hồi chấn động não
    questions: {
      s1Title: "Bước 1: Thông tin cơ bản",
      q1: "1. Độ tuổi hiện tại của bạn?",
      q2: "2. Giới tính của bạn?",
      genderMale: "Nam",
      genderFemale: "Nữ",
      genderOther: "Khác",
      q3: "3. Đã bao nhiêu ngày kể từ khi bạn bị chấn thương?",

      s2Title: "Bước 2: Triệu chứng hôm nay",
      q4: "4. Mức độ đau đầu hôm nay (0 = Không, 5 = Nặng)?",
      q5: "5. Mức độ chóng mặt hôm nay (0 = Không, 5 = Nặng)?",
      q6: "6. Mức độ nhìn mờ hôm nay (0 = Không, 5 = Nặng)?",
      q7: "7. Mức độ buồn nôn hôm nay (0 = Không, 5 = Nặng)?",

      s3Title: "Bước 3: Thể chất",
      q8: "8. Chất lượng giấc ngủ đêm qua (0 = Tệ nhất, 5 = Tốt nhất)?",
      q9: "9. Các triệu chứng có nặng hơn sau khi vận động hôm nay không?",
      q10: "10. Thời gian sử dụng màn hình hôm nay (0 = Không có, 5 = Rất nhiều)?",

      s4Title: "Bước 4: Tải nhận thức",
      q11: "11. Số giờ học tập/làm việc hôm nay (0 = Không có, 5 = Rất nhiều)?",
      q12: "12. Mức độ khó đọc hoặc tập trung hôm nay (0 = Không có, 5 = Nặng)?",
      q13: "13. Bạn đánh giá tâm trạng hôm nay thế nào (0 = Rất thấp, 5 = Rất tốt)?",

      yes: "Có",
      no: "Không",
    },
    // Results & Emergency
    results: {
      gaugeTitle: "Mức Tải Phục Hồi Hiện tại:",
      gaugeConf: "Độ tin cậy:",
      low: "THẤP",
      medium: "TRUNG BÌNH",
      high: "CAO",
      featureTitle: "Yếu tố tác động - Check-in hiện tại",
      recsTitle: "Thẻ hành động",
      historyTitle: "Lịch sử Check-in của bạn",
      actionCards: {
        sleepTitle: "Ưu tiên giấc ngủ hồi phục",
        sleepDesc: "Chất lượng giấc ngủ hiện tại {score}/5. Hãy ngủ đều đặn, đủ giấc và hạn chế màn hình 60 phút trước khi ngủ để hỗ trợ phục hồi.",
        sleepSteps: [
          "Thiết lập khung giờ đi ngủ và thức dậy cố định kể cả cuối tuần.",
          "Tránh sử dụng thiết bị điện tử ít nhất 45 phút trước khi ngủ.",
          "Giữ phòng ngủ mát mẻ, tối và yên tĩnh.",
          "Thử 5 phút hít thở chậm trước khi tắt đèn."
        ],
        studyLoadTitle: "Giảm thời gian dùng màn hình hôm nay",
        studyLoadDesc: "Thời gian dùng màn hình {score}/5. Hãy chia nhỏ thời gian dùng màn hình bằng các khoảng nghỉ ngắn thường xuyên để tránh kích hoạt triệu chứng.",
        studyLoadSteps: [
          "Áp dụng quy tắc 20-20-20: mỗi 20 phút, nhìn xa 20 feet trong 20 giây.",
          "Giảm độ sáng màn hình và tăng cỡ chữ.",
          "Nghỉ không dùng màn hình 10 phút mỗi 30-45 phút.",
          "Tránh dùng màn hình ít nhất 1 giờ trước khi ngủ."
        ],
        studyFocusTitle: "Trở lại học tập/công việc từ từ",
        studyFocusDesc: "Mức độ khó tập trung {score}/5. Rút ngắn thời gian làm việc và tăng dần khi cơ thể cho phép.",
        studyFocusSteps: [
          "Làm việc theo từng đợt ngắn 20-25 phút, xen kẽ nghỉ ngơi.",
          "Xử lý các việc khó nhất vào đầu ngày.",
          "Xin thêm thời gian hoặc giảm khối lượng công việc nếu cần.",
          "Dừng hoạt động ngay khi triệu chứng bắt đầu tăng."
        ],
        anxietyTitle: "Giảm triệu chứng cấp tính",
        anxietyDesc: "Mức độ triệu chứng {score}/5. Nghỉ ngơi ở nơi yên tĩnh, ánh sáng dịu và tránh cố gắng vượt qua sự khó chịu.",
        anxietySteps: [
          "Nghỉ ngơi trong phòng yên tĩnh, ánh sáng thấp cho đến khi triệu chứng dịu bớt.",
          "Tránh hoạt động thể chất hoặc nhận thức cường độ cao lúc này.",
          "Uống đủ nước và tránh caffeine hoặc rượu bia.",
          "Liên hệ đội ngũ chăm sóc nếu triệu chứng tăng nhanh."
        ],
        moodTitle: "Chăm sóc tâm trạng",
        moodDesc: "Điểm tâm trạng {score}/5. Hoạt động nhẹ nhàng và kết nối với người khác có thể giúp ổn định tâm trạng trong quá trình phục hồi.",
        moodSteps: [
          "Dành 10-15 phút ra ngoài trời nếu cơ thể cho phép.",
          "Liên lạc với một người bạn hoặc người thân tin cậy.",
          "Làm một hoạt động nhẹ nhàng, yêu thích (nghe nhạc, vẽ, đi bộ ngắn).",
          "Nếu tâm trạng thấp kéo dài nhiều ngày, hãy trao đổi với đội ngũ chăm sóc."
        ],
        supportTitle: "Dựa vào mạng lưới hỗ trợ",
        supportDesc: "Hỗ trợ xã hội {score}/3. Hãy cho người thân biết tình trạng của bạn hôm nay.",
        supportSteps: [
          "Nhắn tin cho người bạn tin cậy và chia sẻ cảm giác của bạn.",
          "Nhờ bạn bè hoặc người thân giúp một việc gì đó hôm nay.",
          "Chia sẻ kế hoạch phục hồi với người có thể theo dõi giúp bạn.",
          "Đừng ngần ngại yêu cầu sự giúp đỡ cụ thể khi cần."
        ],
        peerTitle: "Chú ý triệu chứng do vận động gây ra",
        peerDesc: "Triệu chứng của bạn nặng hơn sau khi vận động hôm nay. Hãy giảm cường độ và tăng dần hoạt động một cách từ từ hơn.",
        peerSteps: [
          "Dừng hoạt động ngay khi triệu chứng tăng lên.",
          "Nghỉ 24 giờ trước khi thử lại mức độ hoạt động đó.",
          "Lần sau hãy bắt đầu lại với cường độ thấp hơn.",
          "Ghi lại hoạt động nào gây triệu chứng để lên kế hoạch phù hợp."
        ],
        bullyingTitle: "Cân bằng giờ học/làm việc",
        bullyingDesc: "Giờ học/làm việc {score}/5. Các phiên làm việc dài liên tục có thể làm chậm phục hồi — hãy chèn thêm các khoảng nghỉ có cấu trúc.",
        bullyingSteps: [
          "Chia ngày thành các đợt làm việc ngắn hơn, xen kẽ nghỉ ngơi.",
          "Trao đổi với trường học/công ty về lịch trình điều chỉnh.",
          "Chỉ ưu tiên những việc thực sự cần thiết lúc này.",
          "Theo dõi phản ứng triệu chứng và điều chỉnh giờ làm việc phù hợp."
        ],
        activityTitle: "Thêm vận động nhẹ nhàng",
        activityDesc: "Hôm nay bạn chưa vận động. Vận động nhẹ, theo dõi triệu chứng có thể hỗ trợ phục hồi khi được đội ngũ chăm sóc cho phép.",
        activitySteps: [
          "Thử đi bộ ngắn, nhẹ nhàng nếu bạn cảm thấy đủ khỏe.",
          "Dừng ngay nếu có triệu chứng xuất hiện hoặc nặng hơn.",
          "Tránh các môn thể thao đối kháng hoặc cường độ cao cho đến khi được phép.",
          "Hỏi ý kiến đội ngũ chăm sóc trước khi trở lại mức vận động thường ngày."
        ],
        needsTitle: "Giảm cảm giác quá tải hôm nay",
        needsDesc: "Mức độ căng thẳng/quá tải {score}/5. Đơn giản hóa ngày của bạn và chỉ tập trung vào những việc thực sự cần thiết.",
        needsSteps: [
          "Chỉ viết ra 1-3 việc thực sự cần thiết cho hôm nay.",
          "Giao lại hoặc hoãn những việc không gấp.",
          "Chèn các khoảng nghỉ ngắn xuyên suốt ngày.",
          "Nhờ sự hỗ trợ từ gia đình, bạn bè, trường học hoặc công ty."
        ],
        reliefTitle: "Giảm triệu chứng cơ thể",
        reliefDesc: "Mức độ triệu chứng {score}/5. Nghỉ ngơi, uống đủ nước và môi trường yên tĩnh có thể giúp giảm khó chịu.",
        reliefSteps: [
          "Nghỉ ngơi trong phòng yên tĩnh, ánh sáng thấp.",
          "Uống nước đều đặn suốt cả ngày.",
          "Chườm mát lên đầu hoặc cổ nếu điều đó giúp bạn dễ chịu hơn.",
          "Theo dõi tần suất và mức độ triệu chứng để báo với đội ngũ chăm sóc."
        ],
        topDriverTitle: "Tập trung vào yếu tố quan trọng nhất",
        topDriverDesc: "Yếu tố ảnh hưởng lớn nhất: {feature} ({pct}%). Hãy tập trung vào một hành động nhỏ, khả thi cho yếu tố này hôm nay.",
        topDriverSteps: [
          "Xem xét kỹ vì sao yếu tố này ảnh hưởng đến bạn nhiều nhất hôm nay.",
          "Dành một chút thời gian tập trung xử lý riêng vấn đề này.",
          "Hỏi đội ngũ chăm sóc để được hướng dẫn cụ thể cho yếu tố này.",
          "Đặt một mục tiêu nhỏ, thực tế để cải thiện dần dần."
        ],
        highStressTitle: "Ưu tiên phục hồi trong 72 giờ tới",
        highStressDesc: "Mức Tải Phục Hồi của bạn đang cao. Hãy giảm học tập, công việc, màn hình và vận động, đồng thời nghỉ ngơi nhiều hơn trong vài ngày tới.",
        highStressSteps: [
          "Xin giảm giờ học hoặc giờ làm trong vài ngày tới.",
          "Hạn chế tối đa màn hình và các hoạt động tốn nhận thức khác.",
          "Tránh gắng sức thể chất cho đến khi triệu chứng ổn định.",
          "Liên hệ bác sĩ hoặc đội ngũ chăm sóc để rà soát lại triệu chứng."
        ],
        breatheTitle: "Thở chậm để ổn định",
        breatheDesc: "Thử hít thở chậm, đều trong 3-5 phút để giảm căng thẳng.",
        breatheSteps: [
          "Ngồi thoải mái, lưng thẳng.",
          "Hít vào chậm bằng mũi trong 4 giây.",
          "Giữ hơi thở nhẹ nhàng trong 4 giây.",
          "Thở ra chậm bằng miệng trong 6 giây."
        ],
        breaksTitle: "Nghỉ ngắn có chủ đích",
        breaksDesc: "Mỗi 30-45 phút hoạt động, hãy nghỉ 5-10 phút.",
        breaksSteps: [
          "Rời khỏi công việc khi đến giờ nghỉ.",
          "Nhìn vào một điểm xa, yên tĩnh, ví dụ ngoài cửa sổ.",
          "Uống một chút nước hoặc ăn nhẹ.",
          "Tránh dùng màn hình trong lúc nghỉ này."
        ],
        connectTitle: "Kết nối với ai đó",
        connectDesc: "Nhắn tin cho bạn bè, người thân hoặc người chăm sóc để chia sẻ tình trạng hôm nay.",
        connectSteps: [
          "Chọn người mà bạn cảm thấy thoải mái khi trò chuyện.",
          "Bắt đầu bằng một tin nhắn hỏi thăm đơn giản.",
          "Thành thật chia sẻ cảm giác của bạn hôm nay.",
          "Đón nhận sự hỗ trợ, lời khuyên, hoặc đơn giản là được lắng nghe."
        ],
        hydrateTitle: "Uống đủ nước",
        hydrateDesc: "Uống nước đều đặn suốt cả ngày và hạn chế caffeine, đặc biệt là vào cuối ngày.",
        hydrateSteps: [
          "Luôn để chai nước trong tầm tay.",
          "Đặt nhắc nhở uống nước định kỳ.",
          "Thay nước ngọt hoặc đồ uống có caffeine bằng nước lọc khi có thể.",
          "Tránh uống quá nhiều nước ngay trước khi ngủ."
        ],
        weekPlanTitle: "Lập kế hoạch cho tuần",
        weekPlanDesc: "Chọn 3 việc ưu tiên nhất trong tuần và đặt khung thời gian thực tế cho từng việc.",
        weekPlanSteps: [
          "Dùng sổ tay hoặc ứng dụng lịch để lên kế hoạch từng ngày.",
          "Đặt khung giờ cố định cho việc nghỉ ngơi và phục hồi.",
          "Để dành thời gian trống, không lên lịch cho bản thân.",
          "Chỉ nên đặt tối đa 3 việc quan trọng mỗi ngày."
        ]
      },
      insightTitle: "Tổng hợp kết quả check-in",
      trendsTitle: "Xu hướng nổi bật",
      trendsDesc: "Tóm tắt 2-3 xu hướng chính từ check-in hôm nay (tăng/giảm, thay đổi đáng chú ý).",
      touchpointsTitle: "Điểm chạm quan trọng",
      touchpointsDesc: "Nêu các yếu tố ảnh hưởng mạnh nhất đến Mức Tải Phục Hồi hiện tại của bạn (động lực, rào cản, kỳ vọng).",
      disclaimer: "Kết quả AI này không thay thế chẩn đoán y khoa chuyên môn. ConcussionRecovery là công cụ hỗ trợ ra quyết định chỉ phục vụ mục đích lên kế hoạch sơ bộ — luôn tuân theo hướng dẫn từ bác sĩ hoặc đội ngũ chăm sóc của bạn, đặc biệt nếu triệu chứng nặng hoặc đang xấu đi.",
      consentConfirmed: "Đã xác nhận Đồng ý Tham gia.",
      btnHome: "Quay lại trang chủ",
      errorTitle: "Đã có lỗi xảy ra",
      errorDesc: "Không thể phân tích dữ liệu lúc này. Vui lòng thử lại sau.",
      saveRec: "Lưu gợi ý"
    },
    emergency: {
      title: "Cảnh báo An toàn",
      desc: "Bạn đã báo cáo ít nhất một dấu hiệu cảnh báo sau chấn động não. Hệ thống đã dừng khuyến nghị kế hoạch. Hãy tìm đánh giá y tế ngay lập tức.",
      hotlineLabel: "Đường dây hỗ trợ chấn động não 24/7",
      btnCall: "Gọi ngay",
      clinic: "Hoặc liên hệ đội ngũ chăm sóc của bạn, hoặc đến cơ sở cấp cứu gần nhất nếu triệu chứng nặng (ví dụ: đau đầu tăng nặng, nôn nhiều lần, lú lẫn, hoặc mất ý thức).",
      btnUnderstand: "Tôi đã hiểu và sẽ tìm sự trợ giúp"
    },
    legal: {
      close: "Đóng",
      privacy: {
        title: "Chính sách Bảo mật",
        a1h: "Nguyên tắc Ẩn danh",
        a1p: "Hệ thống không thu thập thông tin định danh cá nhân như họ tên, email, số điện thoại hoặc địa chỉ IP.",
        a2h: "Mã hóa Dữ liệu",
        a2p: "Mọi phản hồi đều được mã hóa trước khi lưu trữ. Session ID được tạo ngẫu nhiên và không gắn với danh tính thực.",
        a3h: "Bảo mật Kỹ thuật",
        a3p: "Toàn bộ giao tiếp được bảo vệ bằng HTTPS. Quyền quản trị được kiểm soát chặt chẽ bằng JWT.",
        a4h: "Giới hạn Lưu trữ",
        a4p: "Dữ liệu chỉ phục vụ mục đích cải thiện kế hoạch phục hồi cá nhân hóa của bạn và được xóa trong vòng 3 tháng sau khi dự án kết thúc.",
        a5h: "Báo cáo Tổng hợp",
        a5p: "Kết quả thống kê chỉ hiển thị ở dạng tổng hợp, đảm bảo không thể nhận diện từng cá nhân."
      },
      ethics: {
        title: "Đạo đức Nghiên cứu",
        a1h: "Tính Tự nguyện",
        a1p: "Việc tham gia hoàn toàn tự nguyện. Bạn có thể dừng hoặc thoát bất kỳ lúc nào.",
        a2h: "Giới hạn Chẩn đoán",
        a2p: "ConcussionRecovery là công cụ hỗ trợ ra quyết định, không thay thế chẩn đoán y khoa hoặc điều trị chuyên môn.",
        a3h: "Ưu tiên An toàn Người dùng",
        a3p: "Khi phát hiện Mức Tải Phục Hồi Cao, hệ thống hiển thị thông tin hỗ trợ khẩn cấp và hotline 24/7 (1800 599 920).",
        a4h: "Ngôn ngữ Trung lập",
        a4p: "Hệ thống sử dụng ngôn ngữ trung lập, không gây lo lắng thái quá hoặc kỳ thị.",
        a5h: "Công khai Hạn chế",
        a5p: "Chúng tôi công khai hạn chế của công cụ để đảm bảo tính trung thực và khách quan."
      }
    },
    ui: {
      confidenceInterval: "Khoảng tin cậy",
      details: "Chi tiết",
      predictionOutput: "Đầu ra dự báo",
      languageSwitcher: "Đổi ngôn ngữ",
      noStepsAvailable: "Đang cập nhật các bước thực hiện...",
      backToDashboard: "Quay lại Bảng điều khiển",
      toAnalytics: "Xem Phân tích chuyên sâu",
      dataModule: "Mô-đun dữ liệu",
      module: { dashboard: "Bảng điều khiển", analytics: "Phân tích" },
      toggleDarkMode: "Chuyển chế độ sáng/tối",
      live: "TRỰC TIẾP",
      weekly: "Theo tuần",
      monthly: "Theo tháng",
      campusAvg: "Mức phục hồi điển hình",
      yourStress: "Mức Tải Phục Hồi của bạn",
      highStress: "Mức Tải Phục Hồi Cao",
      you: "Bạn",
      day: "Ngày",
      noData: "Không có dữ liệu",
      lowStress: "Mức tải phục hồi thấp",
      mediumStress: "Mức tải phục hồi trung bình",
      trend: "Xu hướng",
      stable: "Ổn định",
      baseline: "Nền tảng",
      impact: "Tác động",
      impactFactors: "Yếu tố tác động",
      impactFactorsDesc: "Các yếu tố chính ảnh hưởng đến Mức Tải Phục Hồi hiện tại của bạn",
      prominentTrends: "Các xu hướng nổi bật",
      prominentTrendsFallback: "Mẫu Mức Tải Phục Hồi được tổng hợp từ dữ liệu check-in của bạn.",
      criticalTouchpoints: "Các yếu tố cần lưu ý",
      recommendedActions: "Hành động khuyến nghị",
      recommendedActionsDesc: "Các bước phù hợp với hồ sơ phục hồi của bạn hôm nay.",
      showLess: "Thu gọn",
      showMore: "Xem thêm {count}",
      anonymousHistoryDesc: "Lịch sử check-in ẩn danh của bạn trong phiên này.",
      viewFullLog: "Xem toàn bộ nhật ký",
      status: { title: "Trạng thái", good: "Tốt", fair: "Trung bình", needsAttention: "Cần chú ý" },
      dashboard: {
        title: "Bảng điều khiển Phục hồi",
        subtitle: "Câu chuyện phục hồi chấn động não của bạn qua góc nhìn dữ liệu.",
        period: "Tháng 04 năm 2026",
        lifeBalance: "Tổng quan hồi phục",
        lifeBalanceDesc: "Tình trạng hồi phục hiện tại dựa trên lần check-in gần nhất.",
        stressTrend: "Xu hướng Mức Tải Phục Hồi",
        stressTrendDesc: "Mức Tải Phục Hồi theo thời gian so với nhịp độ phục hồi điển hình",
        moodCalendar: "Lịch triệu chứng",
        peerComparison: "So sánh mức phục hồi",
        peerComparisonDesc: "Số liệu hôm nay so với nhịp độ phục hồi điển hình"
      },
      resultsPanel: {
        title: "Phân tích Phục hồi và Kế hoạch Hoạt động",
        subtitle: "Góc nhìn tổng quan về tải nhận thức và các yếu tố Mức Tải Phục Hồi của bạn.",
        last30Days: "30 ngày gần nhất",
        stressLoad: "Mức Tải Phục Hồi",
        stressLoadDesc: "Mô phỏng theo thời gian thực từ check-in hôm nay"
      },
      calendar: { mon: "T2", tue: "T3", wed: "T4", thu: "T5", fri: "T6", sat: "T7", sun: "CN" },
      auth: {
        signInTitle: "Đăng nhập",
        signInSubtitle: "Để giữ kết nối với chúng tôi, vui lòng đăng nhập bằng thông tin cá nhân của bạn",
        signUpTitle: "Tạo tài khoản",
        signUpSubtitle: "Đăng ký với thông tin cá nhân của bạn để sử dụng tất cả các tính năng của trang web",
        emailPlaceholder: "Email",
        passwordPlaceholder: "Mật khẩu",
        namePlaceholder: "Họ và tên",
        signInBtn: "Đăng nhập",
        signUpBtn: "Đăng ký",
        demoNotice: "Sử dụng demo/demo1 để đăng nhập",
        errorInvalid: "Thông tin không chính xác. Thử demo/demo1",
        fillAll: "Vui lòng điền đầy đủ thông tin để đăng ký.",
        welcomeBack: "Chào mừng trở lại!",
        helloFriend: "Chào bạn!"
      }
    },
    about: {
      title: "Về chúng tôi",
      placeholder: "Nội dung đang được cập nhật.",
      btnBack: "Đóng"
    }
  }
};
