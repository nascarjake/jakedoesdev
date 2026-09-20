type MarkdownArticleProps = {
  source: string;
};

type Block =
  | { type: "heading"; depth: 2 | 3; content: string }
  | { type: "paragraph"; content: string }
  | { type: "list"; items: string[] };

function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push({ type: "paragraph", content: paragraph.join(" ") });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (list.length) {
      blocks.push({ type: "list", items: list });
      list = [];
    }
  };

  for (const line of source.split(/\r?\n/)) {
    const heading = line.match(/^(##|###)\s+(.+)$/);
    const listItem = line.match(/^[-*]\s+(.+)$/);

    if (heading) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        depth: heading[1].length as 2 | 3,
        content: heading[2],
      });
    } else if (listItem) {
      flushParagraph();
      list.push(listItem[1]);
    } else if (!line.trim()) {
      flushParagraph();
      flushList();
    } else {
      flushList();
      paragraph.push(line.trim());
    }
  }

  flushParagraph();
  flushList();
  return blocks;
}

export function MarkdownArticle({ source }: MarkdownArticleProps) {
  return (
    <article className="markdown-article">
      {parseBlocks(source).map((block, index) => {
        if (block.type === "heading") {
          return block.depth === 2 ? (
            <h2 key={index}>{block.content}</h2>
          ) : (
            <h3 key={index}>{block.content}</h3>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        return <p key={index}>{block.content}</p>;
      })}
    </article>
  );
}
