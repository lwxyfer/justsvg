import apple from './assets/brand-apple-rag.svg?raw';
import microsoft from './assets/brand-microsoft-rag.svg?raw';
import google from './assets/brand-google-rag.svg?raw';
import openai from './assets/brand-openai-rag.svg?raw';
import claude from './assets/brand-claude-rag.svg?raw';
import notion from './assets/brand-notion-rag.svg?raw';
import applePrompt from './prompts/brand-apple-rag.md?raw';
import microsoftPrompt from './prompts/brand-microsoft-rag.md?raw';
import googlePrompt from './prompts/brand-google-rag.md?raw';
import openaiPrompt from './prompts/brand-openai-rag.md?raw';
import claudePrompt from './prompts/brand-claude-rag.md?raw';
import notionPrompt from './prompts/brand-notion-rag.md?raw';
import stripe from './assets/brand-stripe-rag.svg?raw';
import stripePrompt from './prompts/brand-stripe-rag.md?raw';
import linear from './assets/brand-linear-rag.svg?raw';
import linearPrompt from './prompts/brand-linear-rag.md?raw';
import figma from './assets/brand-figma-rag.svg?raw';
import figmaPrompt from './prompts/brand-figma-rag.md?raw';
import vercel from './assets/brand-vercel-rag.svg?raw';
import vercelPrompt from './prompts/brand-vercel-rag.md?raw';
import manifest from './brand-manifest.json';
import type { ExampleStyle, SvgExample } from './catalog';
const vectors = [apple, microsoft, google, openai, claude, notion, stripe, linear, figma, vercel];
const prompts = [
  applePrompt,
  microsoftPrompt,
  googlePrompt,
  openaiPrompt,
  claudePrompt,
  notionPrompt,
  stripePrompt,
  linearPrompt,
  figmaPrompt,
  vercelPrompt,
];
export const brandStyles: ExampleStyle[] = manifest.map((brand) => ({
  id: `brand-${brand.id}`,
  name: brand.name,
  summary: brand.summary,
  tags: ['品牌灵感', '非官方示例', '架构图'],
  palette: brand.palette,
  brand: { sources: brand.sources, note: brand.evidence },
}));
export const brandExamples: SvgExample[] = manifest.map((brand, i) => ({
  id: `brand-${brand.id}-rag`,
  sourceId: 'brand-rag',
  style: `brand-${brand.id}`,
  name: 'RAG 检索增强生成架构',
  svg: vectors[i],
  prompt: prompts[i],
  width: 1600,
  height: 1100,
}));
