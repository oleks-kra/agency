export default function initTinyMCE() {
  if (window.tinymce && document.getElementById('content')) {
    let articleImagesDirectory;
    if (document.getElementById('articleForm').dataset.action === 'update') {
      const urlPathSegments = window.location.pathname.split('/');
      articleImagesDirectory = urlPathSegments[urlPathSegments.length - 1];
    }
    window.tinymce.init({
      selector: '#content',
      browser_spellcheck: true,
      contextmenu: false,
      image_uploadtab: true,
      image_title: true,
      automatic_uploads: false,
      image_caption: true,
      image_advtab: true,
      file_picker_types: 'image',
      relative_urls: true,
      // 'document_base_url' value gets prefixed to the filename of an image pulled from DB, and the URL is shown in TinyMCE editor. For example, if image filename is stored in DB as 'apple.png,' the URL of the image rendered in TinyMCE editor will reference an image at: document_base_url + apple.png
      document_base_url: `http://localhost:3000/img/blog/article/embeds/${articleImagesDirectory ? articleImagesDirectory : 'temp'}/`,
      // 'images_upload_url' is called when 'window.tinymce.get('content').uploadImages();' is invoked
      images_upload_url: 'http://localhost:3000/api/v1/upload',
      plugins: [
        'advlist',
        'autolink',
        'link',
        'image',
        'lists',
        'charmap',
        'preview',
        'anchor',
        'pagebreak',
        'searchreplace',
        'wordcount',
        'visualblocks',
        'code',
        'fullscreen',
        'codesample',
        'insertdatetime',
        'media',
        'table',
        'emoticons',
        'help'
      ],
      toolbar:
        'undo redo | styles | bold italic | alignleft aligncenter alignright alignjustify | ' +
        'bullist numlist outdent indent | link image | print preview media fullscreen | ' +
        'forecolor backcolor emoticons | help',
      menu: {
        favs: {
          title: 'My Favorites',
          items: 'code codesample visualaid | searchreplace | emoticons'
        }
      },
      menubar: 'favs file edit view insert format tools table help',
      content_style:
        'body { font-family:Helvetica,Arial,sans-serif; font-size:16px }'
    });
    console.log('TinyMCE Initialized!');
  }
}
