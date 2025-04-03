import React from 'react';
import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Heading1,
  Heading2,
  Link,
  Code,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MenuBarProps {
  editor: Editor | null;
}

const MenuBar: React.FC<MenuBarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  // Buton için animasyon varyantları
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95, transition: { duration: 0.1 } },
  };

  // Aktif buton stilini oluştur
  const activeButtonClass = "bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-purple-900/40 shadow-sm";
  const buttonBaseClass = "p-1.5 sm:p-2 rounded hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all";

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-wrap gap-1 p-1.5 sm:p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-t-xl shadow-sm"
    >
      {/* Stilize edici butonlar */}
      <div className="flex gap-1 mr-2 pr-2 border-r border-gray-200 dark:border-gray-700">
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`${buttonBaseClass} ${editor.isActive('bold') ? activeButtonClass : ''}`}
          title="Kalın"
        >
          <Bold className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
        </motion.button>
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`${buttonBaseClass} ${editor.isActive('italic') ? activeButtonClass : ''}`}
          title="İtalik"
        >
          <Italic className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
        </motion.button>
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`${buttonBaseClass} ${editor.isActive('underline') ? activeButtonClass : ''}`}
          title="Altı Çizili"
        >
          <UnderlineIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
        </motion.button>
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`${buttonBaseClass} ${editor.isActive('code') ? activeButtonClass : ''}`}
          title="Kod"
        >
          <Code className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 dark:text-blue-400" />
        </motion.button>
      </div>
      
      {/* Başlık butonları */}
      <div className="flex gap-1 mr-2 pr-2 border-r border-gray-200 dark:border-gray-700">
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`${buttonBaseClass} ${editor.isActive('heading', { level: 1 }) ? activeButtonClass : ''}`}
          title="Başlık 1"
        >
          <Heading1 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
        </motion.button>
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`${buttonBaseClass} ${editor.isActive('heading', { level: 2 }) ? activeButtonClass : ''}`}
          title="Başlık 2"
        >
          <Heading2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
        </motion.button>
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={`${buttonBaseClass} ${editor.isActive('paragraph') ? activeButtonClass : ''}`}
          title="Normal Metin"
        >
          <Type className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-600 dark:text-indigo-400" />
        </motion.button>
      </div>

      {/* Liste butonları */}
      <div className="flex gap-1 mr-2 pr-2 border-r border-gray-200 dark:border-gray-700">
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${buttonBaseClass} ${editor.isActive('bulletList') ? activeButtonClass : ''}`}
          title="Madde İşaretli Liste"
        >
          <List className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
        </motion.button>
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${buttonBaseClass} ${editor.isActive('orderedList') ? activeButtonClass : ''}`}
          title="Numaralı Liste"
        >
          <ListOrdered className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-400" />
        </motion.button>
      </div>

      {/* Hizalama butonları */}
      <div className="flex gap-1">
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          className={`${buttonBaseClass} ${editor.isActive({ textAlign: 'left' }) ? activeButtonClass : ''}`}
          title="Sola Hizala"
        >
          <AlignLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
        </motion.button>
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          className={`${buttonBaseClass} ${editor.isActive({ textAlign: 'center' }) ? activeButtonClass : ''}`}
          title="Ortala"
        >
          <AlignCenter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
        </motion.button>
        <motion.button
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          className={`${buttonBaseClass} ${editor.isActive({ textAlign: 'right' }) ? activeButtonClass : ''}`}
          title="Sağa Hizala"
        >
          <AlignRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 dark:text-emerald-400" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default MenuBar; 