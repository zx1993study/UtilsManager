"""
HTML解析工具
"""
from bs4 import BeautifulSoup
from typing import Optional, List, Dict


def parse_html(html_content: str) -> Optional[BeautifulSoup]:
    """解析HTML内容"""
    try:
        return BeautifulSoup(html_content, 'html.parser')
    except Exception:
        return None


def extract_text(html_content: str, selector: str) -> Optional[str]:
    """提取文本内容"""
    soup = parse_html(html_content)
    if not soup:
        return None
    
    element = soup.select_one(selector)
    return element.get_text(strip=True) if element else None


def extract_links(html_content: str) -> List[Dict[str, str]]:
    """提取所有链接"""
    soup = parse_html(html_content)
    if not soup:
        return []
    
    links = []
    for a_tag in soup.find_all('a', href=True):
        links.append({
            'text': a_tag.get_text(strip=True),
            'href': a_tag['href']
        })
    
    return links
