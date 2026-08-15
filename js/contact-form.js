document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var name = form.name.value.trim();
    var company = form.company.value.trim();
    var phone = form.phone.value.trim();
    var email = form.email.value.trim();
    var message = form.message.value.trim();

    var subject = 'Povpraševanje za najem — ' + name;
    var body = [
      'Ime in priimek: ' + name,
      'Podjetje: ' + (company || '-'),
      'Telefon: ' + (phone || '-'),
      'E-pošta: ' + email,
      '',
      'Sporočilo:',
      message
    ].join('\n');

    window.location.href =
      'mailto:info@renting.si' +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  });
});
