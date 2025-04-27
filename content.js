function processPage() {
  const textarea = document.querySelector('textarea[data-testid="read-only-cursor-text-area"]');
  
  if (textarea) {
    const textareaContent = textarea.value;
    const container = textarea.parentElement;
    
    // ודא שהמיכל קיים ויש לו יכולת להכיל אלמנטים positioned
    if (!container) return;
    container.style.position = "relative"; // ודא שהמיכל תומך במיקום אבסולוטי

    // ניקוי כפתורים קיימים שהוספנו
    const existingButtons = container.querySelectorAll('.github-linker-button');
    existingButtons.forEach(button => button.remove());

    // שימוש ב-DocumentFragment לאופטימיזציה
    const fragment = document.createDocumentFragment();

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
      
      // אם יש URL תקין, יוצר כפתור ומוסיף ל-fragment
      if (workflowUrl) {
        // מחשב את המיקום של השורה בטקסט
        const lineStartIndex = textareaContent.lastIndexOf('\n', match.index) + 1;
        const lineEndIndex = textareaContent.indexOf('\n', match.index);
        const lineText = textareaContent.substring(lineStartIndex, lineEndIndex !== -1 ? lineEndIndex : textareaContent.length);
        
        // יצירת הכפתור עם עיצוב משופר
        const button = document.createElement("button");
        button.classList.add('github-linker-button'); // הוספת המחלקה לזיהוי קל
        
        // קביעת סוג הפריט (action חיצוני, action מקומי, או workflow)
        let itemType = "GitHub Action";
        if (workflowPath.includes('/workflows/')) {
          itemType = "Reusable Workflow";
        } else if (workflowPath.match(/^[\w-]+\/[\w-]+@[\w.-]+$/)) {
          itemType = "External GitHub Action";
        }
        
        // אייקון SVG לקישור חיצוני (בסגנון דומה ל-GitHub Octicons)
        const externalLinkIconSvg = `<svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" fill="currentColor">
            <path fill-rule="evenodd" d="M10.604 1h4.146a.25.25 0 01.25.25v4.146a.25.25 0 01-.427.177L13.03 4.03 9.28 7.78a.75.75 0 01-1.06-1.06l3.75-3.75-1.543-1.543A.25.25 0 0110.604 1zM3.75 2A1.75 1.75 0 002 3.75v8.5c0 .966.784 1.75 1.75 1.75h8.5A1.75 1.75 0 0014 12.25v-3.5a.75.75 0 00-1.5 0v3.5a.25.25 0 01-.25.25h-8.5a.25.25 0 01-.25-.25v-8.5a.25.25 0 01.25-.25h3.5a.75.75 0 000-1.5h-3.5z"></path>
        </svg>`;
        
        // הגדרת הכפתור להיות אייקון בלבד
        button.innerHTML = externalLinkIconSvg;
        button.style.position = "absolute";
        button.style.cursor = "pointer";
        
        // הוספת כותרת טקסט מרחף (tooltip) המציגה את סוג הפריט
        button.title = itemType;
        
        // --- עיצוב חדש בהשראת GitHub - עיצוב מינימליסטי לאייקון ---
        button.style.background = "transparent"; // רקע שקוף
        button.style.color = "#57606a"; // צבע אייקון אפור בהיר
        button.style.border = "none"; // ללא גבול
        button.style.borderRadius = "3px"; // פינות מעוגלות קלות
        button.style.padding = "3px"; // ריווח פנימי מינימלי
        button.style.fontSize = "12px"; // גודל פונט לאייקון
        button.style.lineHeight = "1"; // גובה שורה מינימלי
        button.style.transition = "background-color 0.2s cubic-bezier(0.3, 0, 0.5, 1)"; // אנימציה חלקה
        button.style.zIndex = "1000";

        // אפקטים בריחוף
        button.addEventListener("mouseover", () => {
            button.style.background = "rgba(180, 180, 180, 0.1)"; // רקע אפור שקוף בריחוף
            button.style.color = "#0969da"; // צבע כחול GitHub בריחוף
        });

        button.addEventListener("mouseout", () => {
            button.style.background = "transparent";
            button.style.color = "#57606a";
        });

        // אפקט לחיצה 
        button.addEventListener("mousedown", () => {
            button.style.background = "rgba(180, 180, 180, 0.2)"; // רקע יותר כהה בלחיצה
        });
        
        button.addEventListener("mouseup", () => {
            // חזרה למצב רגיל או hover בהתאם למיקום העכבר
            const isHovering = button.matches(':hover');
            button.style.background = isHovering ? "rgba(180, 180, 180, 0.1)" : "transparent";
            button.style.color = isHovering ? "#0969da" : "#57606a";
        });
        
        // פתיחת הקישור
        button.addEventListener("click", (e) => {
          e.stopPropagation();
          window.open(workflowUrl, "_blank");
        });
        
        // מיקום הכפתור בהתאם לשורה
        const lineNumber = (textareaContent.substring(0, lineStartIndex).match(/\n/g) || []).length;
        const computedStyle = getComputedStyle(textarea);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
        // מיקום הכפתור יוגדר בהמשך
        
        // מיקום הכפתור משמאל למילה "uses:"
        const usesIndex = lineText.indexOf('uses:');
        
        if (usesIndex !== -1) {
          // חישוב המיקום של המילה "uses:" בתוך השורה
          const beforeUsesText = lineText.substring(0, usesIndex);
          const beforeUsesWidth = getTextWidth(beforeUsesText, computedStyle.font);
          const textareaPaddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
          
          // מיקום הכפתור ממש לפני המילה "uses:" (משמאל) - הוספת מרווח גדול יותר
          button.style.left = `${textareaPaddingLeft + beforeUsesWidth - 28}px`; // הגדלת המרווח ל-28 במקום 20 פיקסלים
          
          // העלאת הכפתור מעט למעלה
          button.style.top = `${lineNumber * lineHeight - 1}px`; // הזזה של פיקסל אחד למעלה
        } else {
          // מיקום ברירת המחדל אם לא נמצא "uses:"
          const textareaPaddingLeft = parseFloat(computedStyle.paddingLeft) || 0;
          button.style.left = `${textareaPaddingLeft + 5}px`;
          
          // העלאת הכפתור גם במצב ברירת המחדל
          button.style.top = `${lineNumber * lineHeight - 1}px`;
        }
        
        // הוסף את הכפתור ל-Fragment
        fragment.appendChild(button);
      }
    }
    // הוסף את כל הכפתורים מה-Fragment ל-DOM בפעם אחת
    container.appendChild(fragment);
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
let processTimeout = null; // הוסר pageProcessed כיוון שלא נעשה בו שימוש

// MutationObserver עם debounce ומניעת הרצות כפולות
const observer = new MutationObserver((mutations) => {
  // בדיקה אם כדאי לעבד את העמוד שוב
  // בדוק גם אם textarea עדיין קיים ב-DOM
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
      observer.disconnect(); // *** נתק את ה-Observer לפני העיבוד ***
      try {
        processPage();
      } catch (error) {
          console.error("GitHub Linker Extension: Error during processPage:", error);
      } finally {
          isProcessing = false;
          // *** חבר מחדש את ה-Observer לאחר העיבוד ***
          // ודא שה-targetNode עדיין קיים לפני החיבור מחדש
          const targetNode = document.querySelector('.react-code-view-edit-content-container') || document.body;
          if(targetNode) {
             startObserver(targetNode); // העבר את ה-targetNode לפונקציה
          }
      }
    }
  }, 500); // אפשר לשקול להגדיל את ההשהייה אם עדיין יש בעיות
});

// הגדרת הObserver לצפייה בשינויים רק במקומות הרלוונטיים
// הפונקציה מקבלת כעת את ה-node להאזין לו
const startObserver = (targetNode) => {
  if (!targetNode) return; // הגנה נוספת
  try {
      observer.observe(targetNode, {
        childList: true,
        subtree: true,
        characterData: false, // לא רלוונטי לשינויים שאנחנו מחפשים
        attributes: false    // לא רלוונטי לשינויים שאנחנו מחפשים
      });
  } catch (error) {
      console.error("GitHub Linker Extension: Failed to start observer:", error);
  }
};

// הרצה ראשונית
setTimeout(() => {
  try {
      processPage();
      // מצא את ה-targetNode הראשוני
      const initialTargetNode = document.querySelector('.react-code-view-edit-content-container') || document.body;
      startObserver(initialTargetNode); // התחל להאזין ל-node שנמצא
  } catch (error) {
      console.error("GitHub Linker Extension: Error during initial run:", error);
  }
}, 1000);