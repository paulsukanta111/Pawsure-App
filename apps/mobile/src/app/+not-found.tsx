// Unknown paths (for example the address the prototype page first loads at) go to Today.
import { Redirect } from 'expo-router';

export default function NotFound() {
  return <Redirect href="/" />;
}
