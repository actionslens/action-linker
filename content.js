function processPage() {
  const textarea = document.querySelector('textarea[data-testid="read-only-cursor-text-area"]');
  
  if (textarea) {
    const textareaContent = textarea.value;
    
    // תמיכה במספר פורמטים של workflow ו-actions
    // 1. קובץ workflow מרוחק במבנה מלא: org/repo/.github/workflows/file.yml@ref
    // 2. קובץ workflow מקומי: ./.github/workflows/file.yml
    // 3. קובץ action מרוחק: org/repo/.github/actions/action-name@ref
    // 4. קובץ action חיצוני: org/repo@ref (לדוגמה: aws-actions/configure-aws-credentials@v4)
    const usesRegex = /uses:\s+((?:[\w-]+\/[\w-]+\/\.github\/workflows\/[\w-]+\.ya?ml@[\w.-]+)|(?:[\w-]+\/[\w-]+\/\.github\/actions\/[\w-]+@[\w.-]+)|(?:[\w-]+\/[\w-]+@[\w.-]+)|(?:\.\/\.github\/workflows\/[\w-]+\.ya?ml))/g;
    let match;
    
    while ((match = usesRegex.exec(textareaContent)) !== null) {
      const workflowPath = match[1];
      let workflowUrl;
      
      // קובע אם זה קובץ מקומי או קובץ מרוחק
      if (workflowPath.startsWith('./')) {
        // מקומי - לוקח את הכתובת של הריפו הנוכחי
        const repoUrlMatch = window.location.pathname.match(/^\/([^\/]+)\/([^\/]+)/);
        if (repoUrlMatch) {
          const repoOwner = repoUrlMatch[1];
          const repoName = repoUrlMatch[2];
          
          // זיהוי הענף או התג הנוכחי מהאלמנט החדש
          let branch = 'main'; // ברירת מחדל
          
          // חיפוש אלמנט התג או הענף לפי המבנה החדש
          const refElement = document.querySelector('[data-testid="anchor-button"].ref-selector-class');
          if (refElement) {
            // חיפוש הטקסט של הענף/תג בתוך האלמנט
            const refText = refElement.querySelector('.prc-Text-Text-0ima0')?.textContent?.trim();
            if (refText) {
              branch = refText;
            } else {
              // גיבוי: ניסיון לקרוא את הטקסט המלא של האלמנט
              const fullText = refElement.textContent.trim();
              // הסרת רווחים מיותרים וסינון טקסט לא רלוונטי
              const cleanText = fullText.replace(/\s+/g, ' ').trim();
              if (cleanText) {
                branch = cleanText;
              }
            }
          }
          
          const localPath = workflowPath.substring(2); // הסרת './'
          workflowUrl = `https://github.com/${repoOwner}/${repoName}/blob/${branch}/${localPath}`;
        }
      } else {
        // בדיקה אם זה action חיצוני בפורמט הקצר (org/repo@ref)
        const standardActionRegex = /^([\w-]+\/[\w-]+)@([\w.-]+)$/;
        const standardActionMatch = workflowPath.match(standardActionRegex);
        
        if (standardActionMatch) {
          // פורמט סטנדרטי של action חיצוני
          const repoPath = standardActionMatch[1]; // org/repo
          const ref = standardActionMatch[2]; // ref או גרסה
          workflowUrl = `https://github.com/${repoPath}/tree/${ref}`;
        } else {
          // מרוחק - מפרק את הנתיב לקומפוננטות
          const [pathWithoutRef, ref] = workflowPath.split('@');
          const [repoOwner, repoName, ...pathParts] = pathWithoutRef.split('/');
          const filePath = pathParts.join('/');
          
          // בודק אם מדובר ב-action או ב-workflow
          const isAction = filePath.includes('/actions/');
          
          if (isAction) {
            // עבור actions, נפנה לתיקייה של ה-action
            const actionDirPath = filePath; // לדוגמה: .github/actions/action-name
            workflowUrl = `https://github.com/${repoOwner}/${repoName}/tree/${ref}/${actionDirPath}`;
          } else {
            // עבור workflows, נפנה לקובץ עצמו
            const workflowFile = filePath; // לדוגמה: .github/workflows/file.yml
            workflowUrl = `https://github.com/${repoOwner}/${repoName}/blob/${ref}/${workflowFile}`;
          }
        }
      }
      
      // אם יש URL תקין, יוצר כפתור
      if (workflowUrl) {
        // מחשב את המיקום של השורה בטקסט
        const lineStartIndex = textareaContent.lastIndexOf('\n', match.index) + 1;
        const lineEndIndex = textareaContent.indexOf('\n', match.index);
        const lineText = textareaContent.substring(lineStartIndex, lineEndIndex !== -1 ? lineEndIndex : textareaContent.length);
        
        // מוצא את המיכל של ה-textarea
        const container = textarea.parentElement;
        container.style.position = "relative";
        
        // יצירת הכפתור עם עיצוב משופר
        const button = document.createElement("button");
        
        // קביעת סוג הפריט (action חיצוני, action מקומי, או workflow)
        let itemType = "GitHub Action";
        if (workflowPath.includes('/workflows/')) {
          itemType = "Reusable Workflow";
        } else if (workflowPath.match(/^[\w-]+\/[\w-]+@[\w.-]+$/)) {
          itemType = "External GitHub Action";
        }
                // אייקון SVG לקישור חיצוני (בסגנון דומה ל-GitHub Octicons)
      const externalLinkIconSvg = `<svg aria-hidden="true" height="12" viewBox="0 0 16 16" version="1.1" width="12" fill="currentColor">
              <path fill-rule="evenodd" d="M10.604 1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.75.75 0 01-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1zM3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z"></path>
          </svg>`;
        button.innerHTML = `
        <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span>${itemType}</span>
            ${externalLinkIconSvg}
        </span>`;
        button.style.position = "absolute";
        button.style.cursor = "pointer";
        
          // --- עיצוב חדש בהשראת GitHub ---
          button.style.background = "#f6f8fa"; // רקע אפור בהיר
          button.style.color = "#24292f"; // צבע טקסט כהה
          button.style.border = "1px solid rgba(27, 31, 36, 0.15)"; // גבול עדין
          button.style.borderRadius = "8px"; // פינות מעוגלות סטנדרטיות
          button.style.padding = "3px 12px"; // ריווח פנימי משופר
          button.style.fontSize = "11px"; // פונט מעט גדול יותר
          button.style.fontWeight = "500"; // משקל פונט רגיל-בינוני
          button.style.boxShadow = "0 1px 0 rgba(27, 31, 36, 0.04), inset 0 1px 0 hsla(0,0%,100%,0.25)"; // צל עדין
          button.style.transition = "background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1)"; // אנימציה חלקה
          button.style.lineHeight = "14px"; // גובה שורה תואם לגובה הtextarea
          button.style.zIndex = "1000";

          // אפקטים בריחוף
          button.addEventListener("mouseover", () => {
              button.style.background = "#f3f4f6"; // רקע מעט כהה יותר
              button.style.borderColor = "rgba(27, 31, 36, 0.15)";
          });

          button.addEventListener("mouseout", () => {
              button.style.background = "#f6f8fa";
              button.style.borderColor = "rgba(27, 31, 36, 0.15)";
          });

              // אפקט לחיצה (בדומה ל-GitHub, לא מאוד מורגש אבל קיים)
              button.addEventListener("mousedown", () => {
                  button.style.background = "#edeff2"; // רקע עוד יותר כהה
                  button.style.borderColor = "rgba(27, 31, 36, 0.15)";
                  button.style.boxShadow = "inset 0 1px 0 rgba(27, 31, 36, 0.1)"; // צל פנימי קל
              });
              button.addEventListener("mouseup", () => {
                  // חזרה למצב רגיל או hover בהתאם למיקום העכבר
                  const isHovering = button.matches(':hover');
                  button.style.background = isHovering ? "#f3f4f6" : "#f6f8fa";
                  button.style.boxShadow = "0 1px 0 rgba(27, 31, 36, 0.04), inset 0 1px 0 hsla(0,0%,100%,0.25)";
               });
        
        // פתיחת הקישור
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          window.open(workflowUrl, "_blank");
        });
        
        // מיקום הכפתור בהתאם לשורה
        const lineNumber = (textareaContent.substring(0, lineStartIndex).match(/\n/g) || []).length;
        button.style.top = `${lineNumber * 20 + 1}px`;
        
        // תיאום מיקום הכפתור עם סוף הטקסט של ה-uses
        const usesText = lineText.substring(0, match.index + match[0].length - lineStartIndex);
        const textWidth = getTextWidth(usesText, getComputedStyle(textarea).font);
        button.style.left = `${textWidth + 100}px`; // מרחק של 100 פיקסלים
        
        container.appendChild(button);
      }
    }
  }
}

// פונקציה למדידת רוחב טקסט
function getTextWidth(text, font) {
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  const context = canvas.getContext("2d");
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width;
}

// ניהול הרצות כפולות והגבלת תדירות
let isProcessing = false;
let pageProcessed = false;
let processTimeout = null;

// MutationObserver עם debounce ומניעת הרצות כפולות
const observer = new MutationObserver((mutations) => {
  // בדיקה אם כדאי לעבד את העמוד שוב
  const textarea = document.querySelector('textarea[data-testid="read-only-cursor-text-area"]');
  if (!textarea || isProcessing) return;

  // ביטול טיימר קודם אם קיים
  if (processTimeout) {
    clearTimeout(processTimeout);
  }

  // הגדרת טיימר חדש עם השהייה לביצוע עיבוד
  processTimeout = setTimeout(() => {
    if (!isProcessing) {
      isProcessing = true;
      processPage();
      isProcessing = false;
      pageProcessed = true;
    }
  }, 500);
});

// הגדרת הObserver לצפייה בשינויים רק במקומות הרלוונטיים
const startObserver = () => {
  // אם כבר עיבדנו פעם אחת, המשך לצפות רק בשינויים משמעותיים
  const targetNode = document.querySelector('.react-code-view-edit-content-container') || document.body;
  if (targetNode) {
    observer.observe(targetNode, { 
      childList: true, 
      subtree: true,
      characterData: false,
      attributes: false
    });
  }
};

// הרצה ראשונית
setTimeout(() => {
  processPage();
  startObserver();
}, 1000);