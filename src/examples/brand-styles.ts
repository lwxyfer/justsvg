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
import dropbox from './assets/brand-dropbox-rag.svg?raw';
import dropboxPrompt from './prompts/brand-dropbox-rag.md?raw';
import spotify from './assets/brand-spotify-rag.svg?raw';
import spotifyPrompt from './prompts/brand-spotify-rag.md?raw';
import duolingo from './assets/brand-duolingo-rag.svg?raw';
import duolingoPrompt from './prompts/brand-duolingo-rag.md?raw';
import ibm from './assets/brand-ibm-rag.svg?raw';
import ibmPrompt from './prompts/brand-ibm-rag.md?raw';
import ramp from './assets/brand-ramp-rag.svg?raw';
import rampPrompt from './prompts/brand-ramp-rag.md?raw';
import github from './assets/brand-github-rag.svg?raw';
import githubPrompt from './prompts/brand-github-rag.md?raw';
import slack from './assets/brand-slack-rag.svg?raw';
import slackPrompt from './prompts/brand-slack-rag.md?raw';
import cloudflare from './assets/brand-cloudflare-rag.svg?raw';
import cloudflarePrompt from './prompts/brand-cloudflare-rag.md?raw';
import miro from './assets/brand-miro-rag.svg?raw';
import miroPrompt from './prompts/brand-miro-rag.md?raw';
import airbnb from './assets/brand-airbnb-rag.svg?raw';
import airbnbPrompt from './prompts/brand-airbnb-rag.md?raw';
import cursor from './assets/brand-cursor-rag.svg?raw';
import cursorPrompt from './prompts/brand-cursor-rag.md?raw';
import lovable from './assets/brand-lovable-rag.svg?raw';
import lovablePrompt from './prompts/brand-lovable-rag.md?raw';
import supabase from './assets/brand-supabase-rag.svg?raw';
import supabasePrompt from './prompts/brand-supabase-rag.md?raw';
import n8n from './assets/brand-n8n-rag.svg?raw';
import n8nPrompt from './prompts/brand-n8n-rag.md?raw';
import raycast from './assets/brand-raycast-rag.svg?raw';
import raycastPrompt from './prompts/brand-raycast-rag.md?raw';
import bytedance from './assets/brand-bytedance-rag.svg?raw';
import bytedancePrompt from './prompts/brand-bytedance-rag.md?raw';
import xiaohongshu from './assets/brand-xiaohongshu-rag.svg?raw';
import xiaohongshuPrompt from './prompts/brand-xiaohongshu-rag.md?raw';
import dji from './assets/brand-dji-rag.svg?raw';
import djiPrompt from './prompts/brand-dji-rag.md?raw';
import kimi from './assets/brand-kimi-rag.svg?raw';
import kimiPrompt from './prompts/brand-kimi-rag.md?raw';
import stepfun from './assets/brand-stepfun-rag.svg?raw';
import stepfunPrompt from './prompts/brand-stepfun-rag.md?raw';
import mistral from './assets/brand-mistral-rag.svg?raw';
import mistralPrompt from './prompts/brand-mistral-rag.md?raw';
import perplexity from './assets/brand-perplexity-rag.svg?raw';
import perplexityPrompt from './prompts/brand-perplexity-rag.md?raw';
import cohere from './assets/brand-cohere-rag.svg?raw';
import coherePrompt from './prompts/brand-cohere-rag.md?raw';
import huggingface from './assets/brand-huggingface-rag.svg?raw';
import huggingfacePrompt from './prompts/brand-huggingface-rag.md?raw';
import elevenlabs from './assets/brand-elevenlabs-rag.svg?raw';
import elevenlabsPrompt from './prompts/brand-elevenlabs-rag.md?raw';
import replicate from './assets/brand-replicate-rag.svg?raw';
import replicatePrompt from './prompts/brand-replicate-rag.md?raw';
import manifest from './brand-manifest.json';
import type { ExampleStyle, SvgExample } from './catalog';
const vectors = [
  apple,
  microsoft,
  google,
  openai,
  claude,
  notion,
  stripe,
  linear,
  figma,
  vercel,
  dropbox,
  spotify,
  duolingo,
  ibm,
  ramp,
  github,
  slack,
  cloudflare,
  miro,
  airbnb,
  cursor,
  lovable,
  supabase,
  n8n,
  raycast,
  bytedance,
  xiaohongshu,
  dji,
  kimi,
  stepfun,
  mistral,
  perplexity,
  cohere,
  huggingface,
  elevenlabs,
  replicate,
];
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
  dropboxPrompt,
  spotifyPrompt,
  duolingoPrompt,
  ibmPrompt,
  rampPrompt,
  githubPrompt,
  slackPrompt,
  cloudflarePrompt,
  miroPrompt,
  airbnbPrompt,
  cursorPrompt,
  lovablePrompt,
  supabasePrompt,
  n8nPrompt,
  raycastPrompt,
  bytedancePrompt,
  xiaohongshuPrompt,
  djiPrompt,
  kimiPrompt,
  stepfunPrompt,
  mistralPrompt,
  perplexityPrompt,
  coherePrompt,
  huggingfacePrompt,
  elevenlabsPrompt,
  replicatePrompt,
];
export const brandStyles: ExampleStyle[] = manifest.map((brand) => ({
  id: `brand-${brand.id}`,
  name: brand.name,
  summary: brand.summary,
  tags: [
    '品牌灵感',
    '非官方示例',
    '架构图',
    ...('collection' in brand
      ? [brand.collection === 'community' ? '社区热议' : '中国独角兽']
      : []),
  ],
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
