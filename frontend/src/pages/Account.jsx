export default function Account({ user }) {
  return (
    <div className="page-content">
      <h2>Account</h2>
      <section className="panel">
        <div className="account-card">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          <p><strong>Note:</strong> Taskers can perform tasks and assign reviewers; Reviewers verify tasks.</p>
        </div>
      </section>
    </div>
  );
}
