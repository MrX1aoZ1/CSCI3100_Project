// /src/components/MarkdownEditor.jsx
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import { useTheme } from '@/context/ThemeContext';
import debounce from 'lodash.debounce';

export default function MarkdownEditor({ value, onChange }) {
  const { darkMode } = useTheme();
  const [editMode, setEditMode] = useState(false);
  const [activeLine, setActiveLine] = useState(-1);
  const textareaRef = useRef(null);
  const inputRefs = useRef([]);
  const [cursorPos, setCursorPos] = useState({ line: -1, start: 0, end: 0 });
  
  // 防抖处理更新
  const debouncedUpdate = useRef(
    debounce((newValue) => onChange(newValue), 300)
  ).current;

  // 生成唯一行ID
  const generateLineId = (index, text) => 
    `line-${index}-${text.substring(0, 10)}-${Date.now()}`;

  // 分割为行数组
  const lines = value.split('\n').map((text, index) => ({
    id: generateLineId(index, text),
    text,
    isActive: index === activeLine
  }));

  // 光标位置恢复
  useEffect(() => {
    if (cursorPos.line !== -1 && 
        inputRefs.current[cursorPos.line] &&
        document.activeElement === inputRefs.current[cursorPos.line]
    ) {
      inputRefs.current[cursorPos.line].setSelectionRange(
        cursorPos.start, 
        cursorPos.end
      );
    }
  }, [lines, cursorPos]);

  // 快捷键支持
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveLine(-1);
      if (e.key === 'ArrowUp' && activeLine > 0) {
        e.preventDefault();
        setActiveLine(prev => prev - 1);
      }
      if (e.key === 'ArrowDown' && activeLine < lines.length - 1) {
        e.preventDefault();
        setActiveLine(prev => prev + 1);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeLine, lines.length]);

  // 处理行内容更新
  const handleLineChange = useCallback((index, newValue) => {
    const newLines = [...lines];
    newLines[index].text = newValue;
    debouncedUpdate(newLines.map(l => l.text).join('\n'));
  }, [debouncedUpdate, lines]);

  // 处理行点击
  const handleLineClick = (lineIndex) => {
    setEditMode(false);
    setActiveLine(lineIndex);
  };

  // 处理光标位置记录
  const recordCursorPos = (index, target) => {
    setCursorPos({
      line: index,
      start: target.selectionStart,
      end: target.selectionEnd
    });
  };

  return (
    <div className={`relative h-full ${darkMode ? 'dark' : ''}`}>
      {/* 模式切换按钮 */}
      <button
        onClick={() => {
          setEditMode(!editMode);
          setActiveLine(-1);
        }}
        className="absolute top-2 right-2 z-10 px-2 py-1 text-sm bg-blue-100 dark:bg-slate-700 rounded hover:bg-blue-200 transition-colors"
      >
        {editMode ? '预览模式' : '编辑模式'}
      </button>

      {/* 整体编辑模式 */}
      {editMode ? (
        <textarea
          ref={textareaRef}
          className={`w-full h-full p-4 bg-transparent resize-none focus:outline-none ${
            darkMode ? 'text-gray-200' : 'text-gray-800'
          }`}
          value={value}
          onChange={(e) => debouncedUpdate(e.target.value)}
          placeholder="输入Markdown内容..."
        />
      ) : (
        /* 行级编辑模式 */
        <div className="markdown-preview p-4 h-full overflow-auto">
          {lines.map((line, index) => (
            <div
              key={line.id}  // 使用唯一ID作为key
              className="relative group mb-2"
              onClick={() => handleLineClick(index)}
            >
              {/* 行号 */}
              <div className="absolute left-[-30px] top-0 text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}
              </div>

              {/* 行编辑状态 */}
              {activeLine === index ? (
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  className={`w-full bg-transparent border-b focus:outline-none ${
                    darkMode 
                      ? 'text-gray-200 border-slate-600 focus:border-blue-400' 
                      : 'text-gray-800 border-gray-300 focus:border-blue-500'
                  }`}
                  value={line.text}
                  onChange={(e) => {
                    recordCursorPos(index, e.target);
                    handleLineChange(index, e.target.value);
                  }}
                  onKeyDown={(e) => recordCursorPos(index, e.target)}
                  onBlur={() => setActiveLine(-1)}
                  autoFocus
                />
              ) : (
                /* 渲染状态 */
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                  components={{
                    h1: ({ node, ...props }) => (
                      <h1 className={`text-2xl font-bold my-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`} {...props} />
                    ),
                    code: ({ node, inline, ...props }) => (
                      <code
                        className={`${
                          inline 
                            ? 'px-1 rounded' 
                            : 'block p-4 rounded my-2'
                        } ${
                          darkMode 
                            ? 'bg-slate-700 text-gray-200' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                        {...props}
                      />
                    ),
                    // 其他组件样式...
                  }}
                >
                  {line.text || ' '}
                </ReactMarkdown>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}