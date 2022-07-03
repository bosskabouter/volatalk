const props = ['name', 'email', 'tel', 'addres', 'icon'];
const opts = { multiple: true };
const supported = 'contacts' in navigator && 'ContactsManager' in window;

async function getContacts() {
  if (supported) {
    const contacts = await navigator.contacts.select(props, opts);
    console.debug(contacts);
    return contacts;
  }
}
export { getContacts };
