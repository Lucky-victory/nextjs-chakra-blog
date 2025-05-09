import { useEditor } from "@tiptap/react";
import { Flex, Hide } from "@chakra-ui/react";

import { useMemo } from "react";

import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CharacterCount from "@tiptap/extension-character-count";

import { TableOfContents } from "@/src/lib/editor/extensions/toc";
import { MediaExtension } from "@/src/lib/editor/extensions/media";
import MenuBar from "./MenuBar";
import { SidebarContent } from "./Sidebar";
import { EditorWrapper } from "./Wrapper";
import EditorHeader from "./Header";
import ContentArea from "./ContentArea";
import React from "react";
import { debounce } from "lodash";
import { PostCardExtension } from "@/src/lib/editor/extensions/mini-post-card";
import { PenstackYouTubeExtension } from "@/src/lib/editor/extensions/youtube-embed";
import { PenstackTwitterExtension } from "@/src/lib/editor/extensions/tweet-embed";
import { common, createLowlight } from "lowlight";
const lowlight = createLowlight(common);
import { usePenstackEditorStore } from "@/src/state/penstack-editor";
import { PenstackSlashCommandExtension } from "@/src/lib/editor/extensions/slash-command";
import PenstackBlockquote from "@/src/lib/editor/extensions/blockquote";
import { PenstackCodeblock } from "@/src/lib/editor/extensions/code-block";
import { PenstackHeadingExtension } from "@/src/lib/editor/extensions/heading";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import { extensions } from "@/src/lib/editor/extensions";
function TipTapEditor({
  onUpdate,
  initialContent,
}: {
  onUpdate?: (content: { html: string; text?: string }) => void;
  initialContent?: string;
}) {
  const setEditor = usePenstackEditorStore((state) => state.setEditor);
  const setEditorContent = usePenstackEditorStore(
    (state) => state.setEditorContent
  );
  const debouncedUpdate = useMemo(
    () =>
      debounce((content: { html: string; text?: string }) => {
        onUpdate?.(content);
        setEditorContent(content);
      }, 1000),
    [onUpdate, setEditorContent]
  );
  const editor = useEditor({
    editorProps: { attributes: { class: "penstack-post-editor" } },
    enablePasteRules: true,
    extensions: extensions,
    content: initialContent,
    onCreate: ({ editor }) => {
      setEditor(editor);
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      debouncedUpdate({
        html,
        text,
      });
    },
  });
  return (
    <>
      <EditorHeader />
      <Flex gap={4} py={4} px={{ base: 3, md: 4 }}>
        <EditorWrapper>
          <MenuBar editor={editor} />
          <ContentArea editor={editor} />

          {/* <FloatingMenu editor={editor}>
            <MenuBar editor={editor} />
          </FloatingMenu> */}
        </EditorWrapper>
        <Hide below="lg">
          <SidebarContent />
        </Hide>
        {/* <Box display={{ base: "none", lg: "block" }} maxW={320}></Box> */}
      </Flex>
    </>
  );
}
export default TipTapEditor;
