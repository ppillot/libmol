// this wrapper extends the Marked library to render internal links
// so that they could be captured
import * as Marked from 'marked'

let renderer = new Marked.Renderer()

  renderer.link = function (href: string, title: string, text:string): string {
    let txt:string = ''
    if (/^\w+-\w+$/.test(href)) { // custom libmol link
      txt = '<a href="#' + href + '" '
      txt += (title) ? 'title="' + title + '"' : ''
      txt += '>' + text + '</a>'
    } else {
      txt = '<a href="' + href + '" '
      txt += (title !== '') ? 'title="' + title + '"' : ''
      txt += ' target="_blank">' + text + '</a>'
    }
    return txt
  }

  Marked.setOptions({
    renderer,
    sanitize: true
  })

export default Marked
