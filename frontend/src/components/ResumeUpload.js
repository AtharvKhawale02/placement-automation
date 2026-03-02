import { useState } from "react";

/**
 * ResumeUpload Component
 * Professional resume upload with keyword extraction and preview
 */
function ResumeUpload({ onKeywordsExtracted, currentResume }) {
  const [file, setFile] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Common tech skills to look for
  const SKILL_PATTERNS = [
    // Programming Languages
    'JavaScript', 'Java', 'Python', 'C\\+\\+', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Go', 'Rust', 'TypeScript', 'Scala', 'R', 'MATLAB',
    
    // Web Technologies
    'React', 'Angular', 'Vue', 'Node\\.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'ASP\\.NET', 'jQuery',
    
    // Mobile Development
    'React Native', 'Flutter', 'Android', 'iOS', 'Xamarin',
    
    // Databases
    'MongoDB', 'MySQL', 'PostgreSQL', 'Oracle', 'SQL Server', 'Redis', 'Cassandra', 'DynamoDB', 'Firebase',
    
    // Cloud & DevOps
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'Git', 'GitHub', 'GitLab', 'CI/CD', 'Terraform',
    
    // Data Science & ML
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Scikit-learn', 'Pandas', 'NumPy', 'Data Analysis', 'Statistics',
    
    // Other Technologies
    'REST API', 'GraphQL', 'Microservices', 'Blockchain', 'IoT', 'Cybersecurity', 'Linux', 'Agile', 'Scrum', 'JIRA'
  ];

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(selectedFile.type)) {
      alert('Please upload a PDF, DOC, DOCX, or TXT file');
      return;
    }

    // Validate file size (5MB max)
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);
    setUploadProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 200);

    try {
      // Extract text from file
      const text = await extractTextFromFile(selectedFile);
      setExtractedText(text);

      // Extract keywords
      const extractedKeywords = extractKeywords(text);
      setKeywords(extractedKeywords);

      setUploadProgress(100);
      clearInterval(progressInterval);

      // Call parent callback
      if (onKeywordsExtracted) {
        onKeywordsExtracted(extractedKeywords, text, selectedFile);
      }

      // Success notification
      showNotification('Resume uploaded and analyzed successfully!', 'success');
    } catch (error) {
      console.error('Error processing file:', error);
      showNotification('Error processing resume. Please try again.', 'error');
      clearInterval(progressInterval);
    } finally {
      setIsProcessing(false);
    }
  };

  const extractTextFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const content = e.target.result;

          if (file.type === 'text/plain') {
            resolve(content);
          } else if (file.type === 'application/pdf') {
            // For PDF files, we'll extract visible text
            // In production, use pdf-parse or similar library
            // For now, we'll use a simple approach
            const text = await extractFromPDF(content);
            resolve(text);
          } else {
            // For DOC/DOCX, extract what we can
            // In production, use mammoth or similar library
            resolve(content);
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = reject;

      if (file.type === 'text/plain') {
        reader.readAsText(file);
      } else {
        reader.readAsText(file); // Basic text extraction
      }
    });
  };

  const extractFromPDF = async (content) => {
    // Simple PDF text extraction
    // In production, use proper PDF parsing library
    return content.replace(/[^\x20-\x7E\n]/g, '');
  };

  const extractKeywords = (text) => {
    const foundSkills = [];
    const upperText = text.toUpperCase();

    SKILL_PATTERNS.forEach(pattern => {
      const regex = new RegExp(pattern, 'gi');
      if (regex.test(text)) {
        // Normalize the skill name
        const normalizedSkill = pattern.replace(/\\\./g, '.').replace(/\\\+/g, '+');
        if (!foundSkills.includes(normalizedSkill)) {
          foundSkills.push(normalizedSkill);
        }
      }
    });

    // Also extract from common sections
    const sections = ['SKILLS', 'TECHNICAL SKILLS', 'EXPERTISE', 'TECHNOLOGIES'];
    sections.forEach(section => {
      const sectionRegex = new RegExp(`${section}[:\\s]+([^\\n]{0,500})`, 'i');
      const match = text.match(sectionRegex);
      if (match && match[1]) {
        const sectionSkills = match[1]
          .split(/[,;•\n]/)
          .map(s => s.trim())
          .filter(s => s.length > 2 && s.length < 30);
        
        sectionSkills.forEach(skill => {
          if (!foundSkills.includes(skill)) {
            foundSkills.push(skill);
          }
        });
      }
    });

    return foundSkills.slice(0, 20); // Limit to 20 skills
  };

  const showNotification = (message, type) => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : 'bg-red-600';
    notification.className = `fixed top-20 right-6 ${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-slide-down`;
    
    const icon = type === 'success' 
      ? '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>'
      : '<svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>';
    
    notification.innerHTML = `<div class="flex items-center">${icon}<span class="font-semibold">${message}</span></div>`;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 4000);
  };

  const removeFile = () => {
    setFile(null);
    setExtractedText("");
    setKeywords([]);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="relative">
        <label className="block text-sm font-semibold text-secondary-700 mb-2">
          📄 Upload Resume
        </label>
        
        {!file ? (
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-primary-300 rounded-lg cursor-pointer bg-gradient-to-br from-primary-50 to-accent-50 hover:from-primary-100 hover:to-accent-100 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-12 h-12 mb-3 text-primary-500 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-secondary-700">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-secondary-500">PDF, DOC, DOCX or TXT (MAX. 5MB)</p>
              <p className="text-xs text-primary-600 mt-2 font-medium">AI will extract skills automatically</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="border-2 border-green-300 rounded-lg p-4 bg-gradient-to-br from-green-50 to-emerald-50">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-secondary-900 truncate">{file.name}</p>
                  <p className="text-xs text-secondary-600">{(file.size / 1024).toFixed(2)} KB</p>
                </div>
              </div>
              <button
                onClick={removeFile}
                className="ml-3 text-red-600 hover:text-red-800 transition-colors"
                title="Remove file"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="mb-3">
                <div className="flex justify-between text-xs text-secondary-600 mb-1">
                  <span>Processing resume...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Extracted Keywords */}
            {keywords.length > 0 && (
              <div className="mt-3 p-3 bg-white rounded-lg border border-green-200">
                <p className="text-sm font-semibold text-secondary-700 mb-2 flex items-center">
                  <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  Extracted Skills ({keywords.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gradient-to-r from-primary-100 to-accent-100 text-primary-700 text-xs font-semibold rounded-full border border-primary-200"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current Resume Display */}
      {currentResume && !file && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-semibold">Current Resume:</span> {currentResume}
          </p>
        </div>
      )}
    </div>
  );
}

export default ResumeUpload;
