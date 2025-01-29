import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Link from '@tiptap/extension-link';
import { 
  Bold as BoldIcon, 
  Italic as ItalicIcon, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered,
  Link as LinkIcon
} from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function RichTextEditor({ content, onChange }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Heading.configure({
        levels: [1, 2],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  const setLink = React.useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-border bg-background">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${
            editor.isActive('bold') ? 'bg-primary/10 text-primary' : ''
          }`}
          title="Gras"
        >
          <BoldIcon size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${
            editor.isActive('italic') ? 'bg-primary/10 text-primary' : ''
          }`}
          title="Italique"
        >
          <ItalicIcon size={18} />
        </button>
        <div className="w-px h-6 my-auto bg-border mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-primary/10 text-primary' : ''
          }`}
          title="Titre 1"
        >
          <Heading1 size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-primary/10 text-primary' : ''
          }`}
          title="Titre 2"
        >
          <Heading2 size={18} />
        </button>
        <div className="w-px h-6 my-auto bg-border mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${
            editor.isActive('bulletList') ? 'bg-primary/10 text-primary' : ''
          }`}
          title="Liste à puces"
        >
          <List size={18} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${
            editor.isActive('orderedList') ? 'bg-primary/10 text-primary' : ''
          }`}
          title="Liste numérotée"
        >
          <ListOrdered size={18} />
        </button>
        <div className="w-px h-6 my-auto bg-border mx-1" />
        <button
          onClick={setLink}
          className={`p-2 rounded hover:bg-primary/10 transition-colors ${
            editor.isActive('link') ? 'bg-primary/10 text-primary' : ''
          }`}
          title="Ajouter un lien"
        >
          <LinkIcon size={18} />
        </button>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}