let jQuery = window.jQuery;
if(!window.jQuery) {

    await import('https://code.jquery.com/jquery-3.6.0.min.js');

    jQuery = window.jQuery;//.noConflict(true);
}
export default jQuery;