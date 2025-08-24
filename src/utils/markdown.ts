/**
 * Simple markdown to HTML converter for basic formatting
 */
export function markdownToHtml(markdown: string): string {
    if (!markdown) return '';

    let html = markdown;

    // Convert headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4">$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-4">$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-4">$1</h1>');

    // Convert bold text
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');

    // Convert italic text
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    // Convert unordered lists
    html = html.replace(/^\- (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>');
    html = html.replace(/^  \- (.*$)/gim, '<li class="ml-8 mb-1">◦ $1</li>');
    html = html.replace(/^    \- (.*$)/gim, '<li class="ml-12 mb-1">▪ $1</li>');

    // Convert numbered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>');

    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li class="ml-4[^>]*>.*?<\/li>\s*)+/gs, '<ul class="mb-3">$&</ul>');

    // Convert line breaks to <br> tags, but preserve existing HTML structure
    html = html.replace(/\n(?!<)/g, '<br>');

    // Clean up extra line breaks around HTML elements
    html = html.replace(/<br>\s*(<[^>]+>)/g, '$1');
    html = html.replace(/(<\/[^>]+>)\s*<br>/g, '$1');

    // Convert emojis and special characters (preserve them as-is)

    return html;
}
