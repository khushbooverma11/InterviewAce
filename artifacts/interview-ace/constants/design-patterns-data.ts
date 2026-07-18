// ─── Design Patterns Data ────────────────────────────────────────────────────
// Inline minimal types to avoid circular dependency with learn-data.ts

interface MultiLangCode {
  java?: string;
  cpp?: string;
  python?: string;
}
interface LessonStep {
  id: string;
  title: string;
  content: string;
  codeExample?: string;
  codeLanguage?: string;
  codeExamples?: MultiLangCode;
}
interface Lesson {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  steps: LessonStep[];
}

// ─── SOLID: LSP & ISP ────────────────────────────────────────────────────────

export const lspLesson: Lesson = {
  id: 'lld-solid-lsp',
  title: 'Liskov Substitution Principle',
  description: 'Subtypes must be substitutable for their base types without altering program correctness.',
  difficulty: 'Intermediate',
  estimatedMinutes: 12,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Liskov Substitution Principle (LSP)** states: if S is a subtype of T, then objects of type T may be replaced with objects of type S without breaking the program.\n\nIn plain English: **a subclass must honor the contract of its parent**. If calling `bird.fly()` works for a Bird, it must work for any subclass — including Parrot, Eagle, and Sparrow.\n\nLSP violations often surface as `if (obj instanceof Subclass)` checks in client code — a red flag that the abstraction is broken.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'Without LSP, inheritance becomes a trap. A `Penguin extends Bird` that throws `UnsupportedOperationException` from `fly()` breaks every piece of code that calls `bird.fly()` on a collection of birds.\n\nThe client is forced to add `instanceof` checks, defeating polymorphism. The codebase becomes fragile — every new subclass might silently violate the parent\'s contract.\n\nLSP ensures that inheritance means **"is-a-substitutable-for"**, not just **"shares some code with"**.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A rental car company promises you "a car" when you book. If they give you a car without brakes, that violates your contract — it\'s technically a car but it doesn\'t behave like one.\n\nLSP says: every subclass must deliver on the base class\'s promise. A FlyingBird subtype must be able to fly; if your bird can\'t fly, it shouldn\'t extend FlyingBird.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Preconditions cannot be strengthened** — a subclass method cannot demand more from the caller than the parent.\n\n**Postconditions cannot be weakened** — a subclass method must deliver at least as much as the parent promised.\n\n**Invariants must be preserved** — properties that hold for the base class must still hold in the subclass.\n\n**Exceptions must not widen** — a subclass should not throw new checked exceptions not declared by the parent.\n\n**Design tip**: prefer composition over inheritance when the "is-a" relationship is shaky.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Fixing a classic LSP violation — separating flyable from non-flyable birds:',
      codeExamples: {
        java:
`// ✗ VIOLATION — Penguin cannot fly; throws at runtime
class Bird {
    public void fly() { System.out.println("Flying"); }
}
class Penguin extends Bird {
    @Override
    public void fly() {
        throw new UnsupportedOperationException("Penguins can't fly!");
    }
}

// ✓ LSP-COMPLIANT — separate interfaces by capability
interface Bird {
    String getName();
}
interface FlyingBird extends Bird {
    void fly();
}
interface SwimmingBird extends Bird {
    void swim();
}

class Eagle implements FlyingBird {
    public String getName() { return "Eagle"; }
    public void fly() { System.out.println("Eagle soaring"); }
}
class Penguin implements SwimmingBird {
    public String getName() { return "Penguin"; }
    public void swim() { System.out.println("Penguin swimming"); }
}

// Client code — no instanceof checks needed
static void makeFly(List<FlyingBird> birds) {
    birds.forEach(FlyingBird::fly);  // safe — all can fly
}`,
        cpp:
`#include <iostream>
#include <vector>
#include <string>

// ✗ VIOLATION
class Bird {
public:
    virtual void fly() { std::cout << "Flying\n"; }
    virtual ~Bird() = default;
};
class Penguin : public Bird {
public:
    void fly() override {
        throw std::logic_error("Penguins can't fly!");
    }
};

// ✓ LSP-COMPLIANT — capability-based interfaces
class BirdBase {
public:
    virtual std::string getName() const = 0;
    virtual ~BirdBase() = default;
};
class FlyingBird : public BirdBase {
public:
    virtual void fly() = 0;
};
class SwimmingBird : public BirdBase {
public:
    virtual void swim() = 0;
};

class Eagle : public FlyingBird {
public:
    std::string getName() const override { return "Eagle"; }
    void fly() override { std::cout << "Eagle soaring\n"; }
};
class Penguin2 : public SwimmingBird {
public:
    std::string getName() const override { return "Penguin"; }
    void swim() override { std::cout << "Penguin swimming\n"; }
};

void makeAllFly(const std::vector<FlyingBird*>& birds) {
    for (auto* b : birds) b->fly();  // safe
}`,
        python:
`from abc import ABC, abstractmethod
from typing import Protocol

# ✗ VIOLATION
class Bird:
    def fly(self) -> None:
        print("Flying")

class Penguin(Bird):
    def fly(self) -> None:
        raise NotImplementedError("Penguins can't fly!")

# ✓ LSP-COMPLIANT — use Protocol for structural typing
class FlyingBird(Protocol):
    def fly(self) -> None: ...

class SwimmingBird(Protocol):
    def swim(self) -> None: ...

class Eagle:
    def fly(self) -> None:
        print("Eagle soaring at 200 km/h")

class SwimmingPenguin:
    def swim(self) -> None:
        print("Penguin swimming at 25 km/h")

def make_all_fly(birds: list[FlyingBird]) -> None:
    for bird in birds:
        bird.fly()   # safe — all implement fly()

make_all_fly([Eagle(), Eagle()])`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**True polymorphism** — you can safely substitute any subclass without `instanceof` checks.\n\n**OCP enablement** — LSP-compliant hierarchies are easily extended with new subtypes.\n\n**Predictable behavior** — client code works correctly regardless of which subclass is used.\n\n**Test isolation** — you can test any subclass against the same test suite as the base class.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Shallow hierarchies** — enforcing LSP often leads to flatter, wider hierarchies with more interfaces instead of deep inheritance trees.\n\n**More interfaces** — capability-based design requires more interfaces (FlyingBird, SwimmingBird, RunningBird…).\n\n**Over-engineering risk** — splitting one class into many for theoretical LSP compliance when the codebase is small.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. Explain LSP with the classic Bird/Penguin example and how to fix it.\n2. How does LSP relate to OCP and interface design?\n3. What is "behavioral subtyping"? How does it differ from type subtyping?\n4. Design a shape hierarchy (Rectangle, Square) that satisfies LSP.\n5. How does the `Rectangle extends Shape` / `Square extends Rectangle` problem violate LSP?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Square extends Rectangle** — `Square.setWidth(5)` must also set height to 5 to stay square, but `Rectangle.setWidth(5)` leaves height unchanged. Any code that relies on "setting width doesn\'t change height" breaks when given a Square.\n\n**Throwing from overrides** — throwing `UnsupportedOperationException` in overridden methods is an immediate LSP violation.\n\n**Strengthening preconditions** — a subclass `save(String name)` that throws if name is null when the parent allowed null violates LSP.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Design by contract** — document preconditions, postconditions, and invariants on base class methods; subclasses must honor them.\n\n**Run base-class tests on subclasses** — the same test suite should pass for every implementation of an interface.\n\n**Prefer composition for partial "is-a" relationships** — if your subclass can only do 80% of what the parent promises, compose instead of inherit.' },
    { id: 'summary', title: 'Summary', content: '**LSP in one line**: a subclass must be a drop-in replacement for its parent — no surprises.\n\n**Classic violation**: Penguin extends Bird but throws on fly().\n\n**Fix**: split into fine-grained interfaces (FlyingBird, SwimmingBird) so each type only promises what it can deliver.\n\n**Red flag**: instanceof checks in client code — a sign the hierarchy violates LSP.' },
  ],
};

export const ispLesson: Lesson = {
  id: 'lld-solid-isp',
  title: 'Interface Segregation Principle',
  description: 'Clients should not be forced to depend on interfaces they do not use.',
  difficulty: 'Intermediate',
  estimatedMinutes: 10,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Interface Segregation Principle (ISP)** states that no client should be forced to depend on methods it does not use.\n\nFat interfaces — those with many unrelated methods — force implementors to provide empty or throwing stubs for capabilities they don\'t support. ISP prescribes splitting large interfaces into smaller, role-specific ones.\n\nISP is the interface-level equivalent of SRP: just as a class should have one reason to change, an interface should represent one cohesive role.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'A `Worker` interface with `work()`, `eat()`, and `sleep()` forces a `Robot` class to implement `eat()` and `sleep()` even though robots don\'t do either. Every time `eat()` changes, Robot recompiles — even though it uses none of that logic.\n\nThis creates unnecessary coupling, forces empty/stub implementations, and makes the codebase brittle. ISP prevents this by keeping interfaces narrow and focused.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'Imagine a universal remote control that has 200 buttons — most irrelevant to your TV. You\'re forced to carry all that complexity just to change the channel.\n\nISP says: give each device only the buttons it actually uses. A TV remote has TV buttons; a stereo remote has stereo buttons. Smaller, role-specific remotes are less confusing and less error-prone.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Identify fat interfaces** — find interfaces with methods that not all implementors need.\n\n**Split by role** — group methods by the client that uses them; each group becomes its own interface.\n\n**Compose for multi-role classes** — a class that genuinely does many things can implement multiple small interfaces.\n\n**Client depends only on what it needs** — a `Printer` client imports `Printable`; it never sees `Scanner` or `Fax` methods.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Splitting a fat MultiFunctionDevice interface into role-specific interfaces:',
      codeExamples: {
        java:
`// ✗ VIOLATION — fat interface forces all implementors to stub unused methods
interface MultiFunctionDevice {
    void print(Document d);
    void scan(Document d);
    void fax(Document d);
    void copy(Document d);
}
class SimplePrinter implements MultiFunctionDevice {
    public void print(Document d) { /* real */ }
    public void scan(Document d) { throw new UnsupportedOperationException(); }
    public void fax(Document d)  { throw new UnsupportedOperationException(); }
    public void copy(Document d) { throw new UnsupportedOperationException(); }
}

// ✓ ISP-COMPLIANT — role-specific interfaces
interface Printable  { void print(Document d); }
interface Scannable  { void scan(Document d); }
interface Faxable    { void fax(Document d); }
interface Copyable   { void copy(Document d); }

// Simple printer only implements what it supports
class BasicPrinter implements Printable {
    public void print(Document d) { System.out.println("Printing: " + d.name()); }
}
// Enterprise device implements all roles
class OfficeMFD implements Printable, Scannable, Faxable, Copyable {
    public void print(Document d) { System.out.println("Printing"); }
    public void scan(Document d)  { System.out.println("Scanning"); }
    public void fax(Document d)   { System.out.println("Faxing"); }
    public void copy(Document d)  { System.out.println("Copying"); }
}
// Client only depends on what it needs
class PrintService {
    private final Printable printer;
    PrintService(Printable printer) { this.printer = printer; }
    public void printReport(Document d) { printer.print(d); }
}`,
        cpp:
`#include <iostream>
#include <string>

struct Document { std::string name; };

// ✗ VIOLATION — fat interface
class MultiFunctionDevice {
public:
    virtual void print(const Document& d) = 0;
    virtual void scan(const Document& d) = 0;
    virtual void fax(const Document& d) = 0;
    virtual ~MultiFunctionDevice() = default;
};

// ✓ ISP-COMPLIANT — segregated interfaces
class Printable {
public:
    virtual void print(const Document& d) = 0;
    virtual ~Printable() = default;
};
class Scannable {
public:
    virtual void scan(const Document& d) = 0;
    virtual ~Scannable() = default;
};
class Faxable {
public:
    virtual void fax(const Document& d) = 0;
    virtual ~Faxable() = default;
};

class BasicPrinter : public Printable {
public:
    void print(const Document& d) override {
        std::cout << "Printing: " << d.name << "\n";
    }
};
class OfficeMFD : public Printable, public Scannable, public Faxable {
public:
    void print(const Document& d) override { std::cout << "Print\n"; }
    void scan(const Document& d) override  { std::cout << "Scan\n"; }
    void fax(const Document& d) override   { std::cout << "Fax\n"; }
};

class PrintService {
    Printable& printer_;
public:
    PrintService(Printable& p) : printer_(p) {}
    void printReport(const Document& d) { printer_.print(d); }
};`,
        python:
`from abc import ABC, abstractmethod

# ✗ VIOLATION — fat interface
class MultiFunctionDevice(ABC):
    @abstractmethod
    def print_doc(self, document: str) -> None: ...
    @abstractmethod
    def scan_doc(self, document: str) -> None: ...
    @abstractmethod
    def fax_doc(self, document: str) -> None: ...

class SimplePrinter(MultiFunctionDevice):
    def print_doc(self, document: str) -> None:
        print(f"Printing: {document}")
    def scan_doc(self, document: str) -> None:
        raise NotImplementedError("No scanner")   # forced stub
    def fax_doc(self, document: str) -> None:
        raise NotImplementedError("No fax")

# ✓ ISP-COMPLIANT — using Protocol for structural typing
from typing import Protocol

class Printable(Protocol):
    def print_doc(self, document: str) -> None: ...

class Scannable(Protocol):
    def scan_doc(self, document: str) -> None: ...

class BasicPrinter:
    def print_doc(self, document: str) -> None:
        print(f"Printing: {document}")

class OfficeMFD:
    def print_doc(self, document: str) -> None: print("Print")
    def scan_doc(self, document: str) -> None:  print("Scan")
    def fax_doc(self, document: str) -> None:   print("Fax")

class PrintService:
    def __init__(self, printer: Printable) -> None:
        self._printer = printer
    def print_report(self, doc: str) -> None:
        self._printer.print_doc(doc)

# Works with any Printable — BasicPrinter or OfficeMFD
PrintService(BasicPrinter()).print_report("Q4 Report")`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**No forced stubs** — implementors only implement methods they actually use.\n\n**Smaller, more testable units** — narrow interfaces are easier to mock in tests.\n\n**Reduced coupling** — clients depend only on the methods they call; unrelated changes don\'t affect them.\n\n**Clear role documentation** — each interface communicates exactly one responsibility.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Interface proliferation** — too many tiny interfaces can be harder to navigate than fewer larger ones.\n\n**Finding the right granularity** — splitting too aggressively creates single-method interfaces everywhere.\n\n**Discovery overhead** — new developers may struggle to find the right interface among many.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. Explain ISP with a concrete example of a fat interface and how to fix it.\n2. How does ISP relate to SRP at the interface level?\n3. In Java, how do you implement multiple interfaces? What about C++?\n4. What is the difference between ISP and interface decomposition?\n5. Design a payment system interface that follows ISP.' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Splitting too aggressively** — a one-method interface for every operation is overkill. Group methods used by the same client.\n\n**Mistaking ISP for "one method per interface"** — ISP is about client needs, not method count.\n\n**Not considering client usage** — the right splits depend on which clients use which methods together.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Split by client** — group methods by who calls them, not by what they logically do.\n\n**Role interfaces over header interfaces** — name interfaces after the role they describe (Printable, Readable, Closeable).\n\n**Start fat, refactor to thin** — don\'t over-engineer upfront; split when a second implementation appears that can\'t do everything.' },
    { id: 'summary', title: 'Summary', content: '**ISP in one line**: clients should only see the methods they actually use.\n\n**Classic violation**: a fat Worker interface forcing Robot to implement eat() and sleep().\n\n**Fix**: split into Workable, Eatable, Sleepable; each implementor picks what it supports.\n\n**Result**: no empty stubs, no unnecessary recompilation, smaller testable units.' },
  ],
};

// ─── CREATIONAL PATTERNS ──────────────────────────────────────────────────────

export const factoryMethodLesson: Lesson = {
  id: 'lld-factory-method',
  title: 'Factory Method Pattern',
  description: 'Define an interface for creating objects, but let subclasses decide which class to instantiate.',
  difficulty: 'Beginner',
  estimatedMinutes: 12,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Factory Method** pattern defines an interface for creating an object, but lets subclasses decide which class to instantiate. The factory method defers instantiation to subclasses.\n\nInstead of calling `new ConcreteProduct()` directly, the client calls a `createProduct()` method — which can be overridden to return any subclass.\n\nThis is one of the most widely used patterns in frameworks: Spring\'s `ApplicationContext`, Java\'s `Calendar.getInstance()`, and JDBC\'s `DriverManager.getConnection()` all use it.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'When client code needs objects but shouldn\'t be coupled to their concrete classes, `new ConcreteClass()` is too rigid — it hardcodes the implementation.\n\nIf you later want to swap Logger for AsyncLogger, or MySQLConnection for PostgreSQLConnection, you must change every `new` call site. Factory Method centralizes object creation behind a method that subclasses can override.\n\nThe result: client code depends on an abstraction, not a concrete class — satisfying DIP.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A job recruiter (Creator) finds candidates (Products) for a company. The recruiter knows the role requirements but delegates the actual candidate selection to a specialized technical screener (ConcreteCreator) for engineering roles or an HR screener for HR roles.\n\nThe company doesn\'t care how candidates are sourced — it just wants a qualified hire. The recruiter\'s process (factory method) is the same; the concrete screener (subclass) decides who qualifies.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Creator** — declares the factory method `createProduct()` and contains business logic that uses the product.\n\n**ConcreteCreator** — overrides `createProduct()` to return a specific product subclass.\n\n**Product** — the interface that all created objects implement.\n\n**ConcreteProduct** — the actual object returned by the ConcreteCreator.\n\nThe key: the Creator\'s core logic calls `createProduct()` — a method it doesn\'t know the concrete return type of. The subclass decides.' },
    {
      id: 'implementation', title: 'Implementation', content: 'A notification factory: SMS, Email, or Push — selected by subclass:',
      codeExamples: {
        java:
`// Product interface
public interface Notification {
    void send(String message, String recipient);
}

// Concrete products
public class EmailNotification implements Notification {
    public void send(String message, String recipient) {
        System.out.printf("Email to %s: %s%n", recipient, message);
    }
}
public class SmsNotification implements Notification {
    public void send(String message, String recipient) {
        System.out.printf("SMS to %s: %s%n", recipient, message);
    }
}
public class PushNotification implements Notification {
    public void send(String message, String recipient) {
        System.out.printf("Push to %s: %s%n", recipient, message);
    }
}

// Creator — contains factory method
public abstract class NotificationSender {
    // Factory method — subclasses override this
    protected abstract Notification createNotification();

    // Template method uses the factory method
    public void notifyUser(String message, String userId) {
        Notification n = createNotification();
        String recipient = resolveRecipient(userId);
        n.send(message, recipient);
        log(userId, message);
    }
    private String resolveRecipient(String userId) { return userId + "@example.com"; }
    private void log(String userId, String msg) {
        System.out.println("[LOG] Notified " + userId);
    }
}

// Concrete creators
public class EmailSender extends NotificationSender {
    protected Notification createNotification() { return new EmailNotification(); }
}
public class SmsSender extends NotificationSender {
    protected Notification createNotification() { return new SmsNotification(); }
}

// Usage — client code depends only on NotificationSender
NotificationSender sender = new EmailSender();
sender.notifyUser("Your order shipped!", "user123");

// Swap to SMS with zero client code change
sender = new SmsSender();
sender.notifyUser("Your order shipped!", "user123");`,
        cpp:
`#include <iostream>
#include <memory>
#include <string>

// Product interface
class Notification {
public:
    virtual void send(const std::string& message,
                      const std::string& recipient) = 0;
    virtual ~Notification() = default;
};

// Concrete products
class EmailNotification : public Notification {
public:
    void send(const std::string& msg, const std::string& to) override {
        std::cout << "Email to " << to << ": " << msg << "\n";
    }
};
class SmsNotification : public Notification {
public:
    void send(const std::string& msg, const std::string& to) override {
        std::cout << "SMS to " << to << ": " << msg << "\n";
    }
};

// Creator
class NotificationSender {
protected:
    virtual std::unique_ptr<Notification> createNotification() = 0;
public:
    void notifyUser(const std::string& message, const std::string& userId) {
        auto n = createNotification();
        n->send(message, userId + "@example.com");
        std::cout << "[LOG] Notified " << userId << "\n";
    }
    virtual ~NotificationSender() = default;
};

// Concrete creators
class EmailSender : public NotificationSender {
protected:
    std::unique_ptr<Notification> createNotification() override {
        return std::make_unique<EmailNotification>();
    }
};
class SmsSender : public NotificationSender {
protected:
    std::unique_ptr<Notification> createNotification() override {
        return std::make_unique<SmsNotification>();
    }
};

int main() {
    std::unique_ptr<NotificationSender> sender = std::make_unique<EmailSender>();
    sender->notifyUser("Order shipped!", "user123");
    sender = std::make_unique<SmsSender>();
    sender->notifyUser("Order shipped!", "user123");
}`,
        python:
`from abc import ABC, abstractmethod

# Product interface
class Notification(ABC):
    @abstractmethod
    def send(self, message: str, recipient: str) -> None: ...

# Concrete products
class EmailNotification(Notification):
    def send(self, message: str, recipient: str) -> None:
        print(f"Email to {recipient}: {message}")

class SmsNotification(Notification):
    def send(self, message: str, recipient: str) -> None:
        print(f"SMS to {recipient}: {message}")

class PushNotification(Notification):
    def send(self, message: str, recipient: str) -> None:
        print(f"Push to {recipient}: {message}")

# Creator — defines factory method
class NotificationSender(ABC):
    @abstractmethod
    def create_notification(self) -> Notification:
        """Factory method — subclasses override this."""
        ...

    def notify_user(self, message: str, user_id: str) -> None:
        notification = self.create_notification()
        notification.send(message, f"{user_id}@example.com")
        print(f"[LOG] Notified {user_id}")

# Concrete creators
class EmailSender(NotificationSender):
    def create_notification(self) -> Notification:
        return EmailNotification()

class SmsSender(NotificationSender):
    def create_notification(self) -> Notification:
        return SmsNotification()

# Usage
sender: NotificationSender = EmailSender()
sender.notify_user("Your order shipped!", "user123")
sender = SmsSender()
sender.notify_user("Your order shipped!", "user123")`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Eliminates tight coupling** — the creator never calls `new ConcreteProduct()` directly.\n\n**Open for extension** — add a new product (PushNotification) by adding a new ConcreteCreator; no existing code changes.\n\n**Single responsibility** — creation logic lives in the factory method, not scattered across the codebase.\n\n**Framework extensibility** — frameworks define Creators; apps subclass them to customize which products are made.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Subclass explosion** — you need one ConcreteCreator per ConcreteProduct, which can lead to many small classes.\n\n**Indirection** — tracing object creation requires jumping through the hierarchy.\n\n**Over-engineering for simple cases** — if only one product exists and will never change, a factory method is unnecessary overhead.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is the difference between Factory Method and Simple Factory?\n2. How does Factory Method implement OCP?\n3. Compare Factory Method vs Abstract Factory — when do you choose each?\n4. Design a logging framework using Factory Method.\n5. How does JDBC\'s DriverManager.getConnection() implement Factory Method?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Confusing with Simple Factory** — a static `create()` method is not Factory Method. Factory Method requires subclassing and overriding.\n\n**Making the factory method public** — it should usually be `protected`; the public API is the template method that calls it.\n\n**Not returning an interface** — the factory method should return the Product interface, not a concrete type.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Combine with Template Method** — the Creator\'s core logic is a template method; the factory method is the hook subclasses override.\n\n**Consider a parameterized factory** — instead of one ConcreteCreator per product, pass a type parameter to `createProduct(type)` for simpler registries.\n\n**Return interfaces, not concretions** — the factory method return type should always be the abstract Product.' },
    { id: 'summary', title: 'Summary', content: '**Factory Method in one line**: "let subclasses decide what to create."\n\n**When to use**: when a class can\'t anticipate the type of objects it must create, or when you want subclasses to specify the objects.\n\n**Real examples**: `Calendar.getInstance()`, JDBC `Connection`, Spring\'s `BeanFactory`.\n\n**Key trade-off**: flexibility vs. subclass proliferation.' },
  ],
};

export const abstractFactoryLesson: Lesson = {
  id: 'lld-abstract-factory',
  title: 'Abstract Factory Pattern',
  description: 'Create families of related objects without specifying their concrete classes.',
  difficulty: 'Intermediate',
  estimatedMinutes: 15,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Abstract Factory** pattern provides an interface for creating **families of related objects** without specifying their concrete classes.\n\nWhere Factory Method creates one product, Abstract Factory creates a suite of products that are designed to work together (e.g., a UI toolkit\'s Button + TextField + Checkbox for Windows vs. macOS).\n\nReal examples: Java\'s `DocumentBuilderFactory`, AWS SDK\'s service clients per region, and UI theme kits.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'When your system must work with multiple families of related products (e.g., Windows UI vs macOS UI), you need to ensure that only products from the same family are used together — you don\'t want a Windows Button with a macOS TextField.\n\nWithout Abstract Factory, client code is full of conditionals: `if (os == WINDOWS) new WinButton() else new MacButton()`. Every new OS requires changing every conditional.\n\nAbstract Factory centralizes all family creation behind one interface — swap the factory, swap the entire family.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A furniture store sells sets: Victorian (sofa + chair + table) or Modern (sofa + chair + table). Each set is a family — pieces within a set match; mixing Victorian sofa with Modern chair looks wrong.\n\nThe store catalog is the Abstract Factory. Victorian Catalog and Modern Catalog are Concrete Factories. Each factory creates the matching family members.' },
    { id: 'how-it-works', title: 'How It Works', content: '**AbstractFactory** — declares creation methods for each product in the family (`createButton()`, `createTextField()`).\n\n**ConcreteFactory** — implements all creation methods for one product family (WindowsFactory, MacFactory).\n\n**AbstractProduct** — interface for each product type (Button, TextField).\n\n**ConcreteProduct** — specific implementations per family (WindowsButton, MacButton).\n\n**Client** — uses only the AbstractFactory and AbstractProduct interfaces; never instantiates products directly.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Cross-platform UI widget factory:',
      codeExamples: {
        java:
`// Abstract products
interface Button    { void render(); void onClick(); }
interface TextField { void render(); String getValue(); }

// Concrete products — Windows family
class WindowsButton implements Button {
    public void render()   { System.out.println("[Win] Rendering button"); }
    public void onClick()  { System.out.println("[Win] Button clicked"); }
}
class WindowsTextField implements TextField {
    private String value = "";
    public void render()       { System.out.println("[Win] Rendering text field"); }
    public String getValue()   { return value; }
}

// Concrete products — macOS family
class MacButton implements Button {
    public void render()   { System.out.println("[Mac] Rendering button"); }
    public void onClick()  { System.out.println("[Mac] Button clicked"); }
}
class MacTextField implements TextField {
    private String value = "";
    public void render()       { System.out.println("[Mac] Rendering text field"); }
    public String getValue()   { return value; }
}

// Abstract factory
interface UIFactory {
    Button createButton();
    TextField createTextField();
}

// Concrete factories
class WindowsFactory implements UIFactory {
    public Button createButton()       { return new WindowsButton(); }
    public TextField createTextField() { return new WindowsTextField(); }
}
class MacFactory implements UIFactory {
    public Button createButton()       { return new MacButton(); }
    public TextField createTextField() { return new MacTextField(); }
}

// Client — never touches concrete classes
class LoginForm {
    private final Button submitBtn;
    private final TextField userField;

    LoginForm(UIFactory factory) {
        this.submitBtn = factory.createButton();
        this.userField = factory.createTextField();
    }
    void render() {
        userField.render();
        submitBtn.render();
    }
}

// Swap entire UI family with one line
UIFactory factory = System.getProperty("os.name").contains("Win")
    ? new WindowsFactory() : new MacFactory();
new LoginForm(factory).render();`,
        cpp:
`#include <iostream>
#include <memory>
#include <string>

// Abstract products
class Button { public: virtual void render() = 0; virtual ~Button() = default; };
class TextField { public: virtual void render() = 0; virtual ~TextField() = default; };

// Windows family
class WindowsButton : public Button {
public: void render() override { std::cout << "[Win] Button\n"; }
};
class WindowsTextField : public TextField {
public: void render() override { std::cout << "[Win] TextField\n"; }
};

// Mac family
class MacButton : public Button {
public: void render() override { std::cout << "[Mac] Button\n"; }
};
class MacTextField : public TextField {
public: void render() override { std::cout << "[Mac] TextField\n"; }
};

// Abstract factory
class UIFactory {
public:
    virtual std::unique_ptr<Button> createButton() = 0;
    virtual std::unique_ptr<TextField> createTextField() = 0;
    virtual ~UIFactory() = default;
};

// Concrete factories
class WindowsFactory : public UIFactory {
public:
    std::unique_ptr<Button> createButton() override {
        return std::make_unique<WindowsButton>();
    }
    std::unique_ptr<TextField> createTextField() override {
        return std::make_unique<WindowsTextField>();
    }
};
class MacFactory : public UIFactory {
public:
    std::unique_ptr<Button> createButton() override {
        return std::make_unique<MacButton>();
    }
    std::unique_ptr<TextField> createTextField() override {
        return std::make_unique<MacTextField>();
    }
};

class LoginForm {
    std::unique_ptr<Button> btn_;
    std::unique_ptr<TextField> field_;
public:
    LoginForm(UIFactory& factory)
        : btn_(factory.createButton()), field_(factory.createTextField()) {}
    void render() { field_->render(); btn_->render(); }
};

int main() {
    WindowsFactory wf;
    LoginForm form(wf);
    form.render();
}`,
        python:
`from abc import ABC, abstractmethod

# Abstract products
class Button(ABC):
    @abstractmethod
    def render(self) -> None: ...

class TextField(ABC):
    @abstractmethod
    def render(self) -> None: ...

# Windows family
class WindowsButton(Button):
    def render(self) -> None: print("[Win] Button rendered")

class WindowsTextField(TextField):
    def render(self) -> None: print("[Win] TextField rendered")

# macOS family
class MacButton(Button):
    def render(self) -> None: print("[Mac] Button rendered")

class MacTextField(TextField):
    def render(self) -> None: print("[Mac] TextField rendered")

# Abstract factory
class UIFactory(ABC):
    @abstractmethod
    def create_button(self) -> Button: ...
    @abstractmethod
    def create_text_field(self) -> TextField: ...

# Concrete factories
class WindowsFactory(UIFactory):
    def create_button(self) -> Button:       return WindowsButton()
    def create_text_field(self) -> TextField: return WindowsTextField()

class MacFactory(UIFactory):
    def create_button(self) -> Button:       return MacButton()
    def create_text_field(self) -> TextField: return MacTextField()

# Client
class LoginForm:
    def __init__(self, factory: UIFactory) -> None:
        self._btn   = factory.create_button()
        self._field = factory.create_text_field()

    def render(self) -> None:
        self._field.render()
        self._btn.render()

import sys
factory: UIFactory = WindowsFactory() if sys.platform == "win32" else MacFactory()
LoginForm(factory).render()`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Family consistency** — products from the same factory are guaranteed to be compatible.\n\n**Easy family swap** — replace one factory with another to change the entire product family.\n\n**OCP** — add a new family (LinuxFactory) without touching existing client code.\n\n**Single responsibility** — creation logic for each family is encapsulated in its factory.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Adding new products is hard** — adding a new product type (Checkbox) requires changing the AbstractFactory interface and all ConcreteFactories.\n\n**Many classes** — for N families × M products, you get N*M concrete product classes + N concrete factories.\n\n**Overkill for single product** — when you only need one type of object, use Factory Method instead.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is the difference between Factory Method and Abstract Factory?\n2. When would you choose Abstract Factory over Factory Method?\n3. How does Abstract Factory implement OCP? Where does it violate OCP?\n4. Design a database access layer using Abstract Factory (MySQL vs PostgreSQL).\n5. How do UI toolkits (Swing, Qt) use Abstract Factory?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Confusing with Factory Method** — Factory Method uses inheritance (subclasses override); Abstract Factory uses composition (factory object injected).\n\n**One factory per product** — each ConcreteFactory must create the full family; don\'t create a factory for just one product type.\n\n**Adding products without updating all factories** — adding `createIcon()` to the interface forces every ConcreteFactory to implement it.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Start with Factory Method; upgrade to Abstract Factory** when you have multiple families of related objects.\n\n**Parameterize the factory** — instead of one factory per family, use a factory with a family enum parameter for simpler registries.\n\n**Keep factories stateless** — concrete factories should be pure creators; no business logic.' },
    { id: 'summary', title: 'Summary', content: '**Abstract Factory in one line**: "create a whole family of related objects with one factory."\n\n**When to use**: multiple product families that must stay consistent (Windows UI vs macOS UI, MySQL vs PostgreSQL).\n\n**Key insight**: swap the factory → swap the entire product family with zero client code changes.\n\n**Trade-off**: easy to add new families; hard to add new products to existing families.' },
  ],
};

export const builderLesson: Lesson = {
  id: 'lld-builder',
  title: 'Builder Pattern',
  description: 'Construct complex objects step by step, separating construction from representation.',
  difficulty: 'Intermediate',
  estimatedMinutes: 12,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Builder** pattern constructs complex objects step by step. It separates the construction of an object from its final representation, so the same construction process can create different representations.\n\nBuilders are ideal for objects with many optional parameters — they eliminate the need for telescoping constructors (`new User(name, null, null, age, null, true, null)`).\n\nReal examples: Java\'s `StringBuilder`, Lombok\'s `@Builder`, HTTP request builders, SQL query builders, and stream processing pipelines.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'A `Pizza` object might have crust, size, sauce, cheese, and 10 optional toppings. A constructor with 14 parameters is unreadable and error-prone — it\'s easy to pass parameters in the wrong order.\n\nAlternative: telescoping constructors (`Pizza()`, `Pizza(size)`, `Pizza(size, crust)`, ...) become exponential.\n\nBuilder solves this by providing a fluent API: `new Pizza.Builder().size(LARGE).crust(THIN).addTopping(CHEESE).build()`.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'Building a custom PC: you choose the CPU, RAM, GPU, storage, and case step by step. The computer shop (Director) follows the same assembly steps, but the parts you choose (Builder) determine the final machine.\n\nYou don\'t receive a half-built PC after each step — you specify everything, then hit "Order" and receive the complete machine.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Builder interface** — declares the steps for building all parts of the product.\n\n**ConcreteBuilder** — implements the steps, tracks partial state, provides `build()` to return the product.\n\n**Director** (optional) — calls builder steps in a specific order to construct a common configuration.\n\n**Product** — the complex object being built; often immutable (all fields set once in `build()`).\n\n**Fluent API** — each builder setter returns `this`, enabling method chaining.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Immutable HTTP Request builder:',
      codeExamples: {
        java:
`import java.util.*;

// Product — immutable, all fields set by Builder
public final class HttpRequest {
    private final String method;
    private final String url;
    private final Map<String, String> headers;
    private final String body;
    private final int timeoutMs;

    private HttpRequest(Builder b) {
        this.method    = b.method;
        this.url       = b.url;
        this.headers   = Collections.unmodifiableMap(new HashMap<>(b.headers));
        this.body      = b.body;
        this.timeoutMs = b.timeoutMs;
    }

    public String getMethod()           { return method; }
    public String getUrl()              { return url; }
    public Map<String, String> getHeaders() { return headers; }
    public String getBody()             { return body; }
    public int getTimeoutMs()           { return timeoutMs; }

    @Override
    public String toString() {
        return method + " " + url + " [timeout=" + timeoutMs + "ms]";
    }

    // Static nested Builder
    public static class Builder {
        private final String method;   // required
        private final String url;      // required
        private Map<String, String> headers = new HashMap<>();
        private String body       = "";
        private int    timeoutMs  = 5000;

        public Builder(String method, String url) {
            this.method = Objects.requireNonNull(method);
            this.url    = Objects.requireNonNull(url);
        }
        public Builder header(String key, String value) {
            headers.put(key, value); return this;
        }
        public Builder body(String body)         { this.body = body; return this; }
        public Builder timeout(int ms)           { this.timeoutMs = ms; return this; }
        public HttpRequest build()               { return new HttpRequest(this); }
    }
}

// Usage — fluent, readable, no positional confusion
HttpRequest request = new HttpRequest.Builder("POST", "https://api.example.com/orders")
    .header("Authorization", "Bearer token123")
    .header("Content-Type", "application/json")
    .body("{\\"item\\": \\"book\\", \\"qty\\": 2}")
    .timeout(10_000)
    .build();

System.out.println(request);`,
        cpp:
`#include <iostream>
#include <string>
#include <unordered_map>

class HttpRequest {
public:
    struct Builder {
        std::string method, url, body;
        std::unordered_map<std::string, std::string> headers;
        int timeoutMs = 5000;

        Builder(std::string m, std::string u)
            : method(std::move(m)), url(std::move(u)) {}

        Builder& header(const std::string& k, const std::string& v) {
            headers[k] = v; return *this;
        }
        Builder& setBody(const std::string& b) { body = b; return *this; }
        Builder& timeout(int ms)               { timeoutMs = ms; return *this; }
        HttpRequest build()                    { return HttpRequest(*this); }
    };

    void print() const {
        std::cout << method << " " << url
                  << " [timeout=" << timeoutMs << "ms]\n";
    }

private:
    friend struct Builder;
    std::string method, url, body;
    std::unordered_map<std::string, std::string> headers;
    int timeoutMs;

    explicit HttpRequest(const Builder& b)
        : method(b.method), url(b.url), body(b.body),
          headers(b.headers), timeoutMs(b.timeoutMs) {}
};

int main() {
    HttpRequest req = HttpRequest::Builder("POST", "https://api.example.com/orders")
        .header("Authorization", "Bearer token")
        .header("Content-Type", "application/json")
        .setBody(R"({"item":"book","qty":2})")
        .timeout(10000)
        .build();
    req.print();
}`,
        python:
`from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional

@dataclass(frozen=True)          # immutable product
class HttpRequest:
    method: str
    url: str
    headers: dict[str, str] = field(default_factory=dict)
    body: str = ""
    timeout_ms: int = 5000

    def __str__(self) -> str:
        return f"{self.method} {self.url} [timeout={self.timeout_ms}ms]"


class HttpRequestBuilder:
    """Fluent builder for HttpRequest."""

    def __init__(self, method: str, url: str) -> None:
        self._method     = method
        self._url        = url
        self._headers:  dict[str, str] = {}
        self._body      = ""
        self._timeout   = 5000

    def header(self, key: str, value: str) -> HttpRequestBuilder:
        self._headers[key] = value
        return self

    def body(self, body: str) -> HttpRequestBuilder:
        self._body = body
        return self

    def timeout(self, ms: int) -> HttpRequestBuilder:
        self._timeout = ms
        return self

    def build(self) -> HttpRequest:
        return HttpRequest(
            method=self._method,
            url=self._url,
            headers=dict(self._headers),
            body=self._body,
            timeout_ms=self._timeout,
        )


# Usage
request = (
    HttpRequestBuilder("POST", "https://api.example.com/orders")
    .header("Authorization", "Bearer token123")
    .header("Content-Type", "application/json")
    .body('{"item": "book", "qty": 2}')
    .timeout(10_000)
    .build()
)
print(request)`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Readable object creation** — fluent API makes the construction intent clear.\n\n**Immutable products** — builder accumulates mutable state; `build()` creates an immutable object.\n\n**Optional parameters** — each setter is optional; unset fields get sensible defaults.\n\n**Reusable builders** — the same builder can construct variations by calling different methods.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**More code** — each Builder class mirrors the Product\'s fields.\n\n**Incomplete object risk** — calling `build()` before setting required fields (mitigated by validation in `build()`).\n\n**Overkill for simple objects** — 2-3 field objects don\'t benefit from a Builder.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What problem does Builder solve that constructor overloading doesn\'t?\n2. What is the difference between Builder and Factory patterns?\n3. How do you validate that required fields are set before building?\n4. Design a SQL query builder using the Builder pattern.\n5. How does Lombok\'s @Builder work under the hood?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Forgetting to validate** — `build()` should throw if required fields are missing.\n\n**Mutable product** — if the product is mutable, callers can change it after construction; prefer immutable products.\n\n**Builder for everything** — a User with just `name` and `email` doesn\'t need a Builder; use a 2-parameter constructor.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Make required fields constructor parameters of Builder** — `new Builder(requiredA, requiredB)` — so they can\'t be omitted.\n\n**Validate in `build()`** — throw `IllegalStateException` for missing required fields.\n\n**Return immutable products** — use `Collections.unmodifiableMap()` or record/dataclass in the product.' },
    { id: 'summary', title: 'Summary', content: '**Builder in one line**: fluent step-by-step construction of complex objects.\n\n**When to use**: objects with many optional parameters, immutable objects with complex initialization.\n\n**Java idiom**: static nested Builder class; `build()` returns immutable product.\n\n**Real examples**: StringBuilder, Lombok @Builder, OkHttp Request.Builder, Spring MockMvcRequestBuilders.' },
  ],
};

export const prototypeLesson: Lesson = {
  id: 'lld-prototype',
  title: 'Prototype Pattern',
  description: 'Clone existing objects instead of constructing new ones from scratch.',
  difficulty: 'Beginner',
  estimatedMinutes: 10,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Prototype** pattern creates new objects by cloning an existing instance (the prototype) rather than building from scratch.\n\nWhen object creation is expensive (DB lookup, API call, deep initialization), clone a pre-built prototype and customize only the differing fields.\n\nReal examples: Java\'s `Object.clone()`, JavaScript\'s prototype chain, Unity\'s `Instantiate()` for game objects, and document template systems.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'Some objects are expensive to create: a Game Character that loads textures, computes stats, and runs initialization scripts.\n\nCreating 100 identical enemy soldiers from scratch wastes CPU on repeated initialization. Instead, create one fully initialized prototype and clone it 99 times — each clone gets the same baseline state and you customize only health/position.\n\nPrototype also solves the case where you must copy an object but don\'t know its concrete type.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A photocopier clones a document. You don\'t retype the entire contract for each client — you copy the template and fill in the client-specific fields.\n\nThe original document is the Prototype. The copy machine is the `clone()` method. Each copy starts from the same base but can be customized independently.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Prototype interface** — declares the `clone()` method.\n\n**Concrete Prototype** — implements `clone()` to return a copy of itself.\n\n**Shallow copy** — fields are copied by reference; nested objects are shared.\n\n**Deep copy** — all nested objects are also cloned recursively; modifications to the clone don\'t affect the original.\n\n**Prototype Registry** — a map of named prototypes for quick retrieval and cloning.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Game character prototype with deep copy:',
      codeExamples: {
        java:
`import java.util.*;

// Prototype interface
public interface Cloneable<T> {
    T cloneObject();
}

// Stats value object (deep-copied)
public class CharacterStats {
    public int health, mana, attack, defense;
    public CharacterStats(int h, int m, int a, int d) {
        this.health = h; this.mana = m; this.attack = a; this.defense = d;
    }
    public CharacterStats copy() {
        return new CharacterStats(health, mana, attack, defense);
    }
}

// Concrete Prototype
public class GameCharacter implements Cloneable<GameCharacter> {
    private String name;
    private String characterClass;
    private CharacterStats stats;
    private List<String> skills;

    public GameCharacter(String name, String cls, CharacterStats stats, List<String> skills) {
        this.name = name; this.characterClass = cls;
        this.stats = stats; this.skills = skills;
    }

    @Override
    public GameCharacter cloneObject() {
        // Deep copy — clone stats and skills list
        return new GameCharacter(
            name,
            characterClass,
            stats.copy(),
            new ArrayList<>(skills)
        );
    }

    public void setName(String name) { this.name = name; }
    public void addSkill(String skill) { skills.add(skill); }
    public void takeDamage(int dmg) { stats.health -= dmg; }

    @Override
    public String toString() {
        return name + " (" + characterClass + ") HP:" + stats.health + " Skills:" + skills;
    }
}

// Prototype Registry
public class CharacterRegistry {
    private final Map<String, GameCharacter> prototypes = new HashMap<>();

    public void register(String key, GameCharacter prototype) {
        prototypes.put(key, prototype);
    }
    public GameCharacter create(String key) {
        return prototypes.get(key).cloneObject();
    }
}

// Usage
CharacterStats warriorStats = new CharacterStats(200, 50, 35, 40);
GameCharacter warriorProto = new GameCharacter("Warrior", "Fighter",
    warriorStats, new ArrayList<>(List.of("Shield Bash", "Charge")));

CharacterRegistry registry = new CharacterRegistry();
registry.register("warrior", warriorProto);

// Clone 3 enemy warriors — each starts with same stats
GameCharacter w1 = registry.create("warrior"); w1.setName("Guard1");
GameCharacter w2 = registry.create("warrior"); w2.setName("Guard2");
w2.takeDamage(50);  // only affects w2

System.out.println(w1);  // HP:200
System.out.println(w2);  // HP:150 — independent copy`,
        cpp:
`#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <memory>

// Prototype interface
class Shape {
public:
    virtual std::unique_ptr<Shape> clone() const = 0;
    virtual void draw() const = 0;
    int x = 0, y = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
public:
    int radius;
    std::string color;

    Circle(int r, const std::string& c) : radius(r), color(c) {}

    std::unique_ptr<Shape> clone() const override {
        return std::make_unique<Circle>(*this);  // copy constructor = shallow
    }
    void draw() const override {
        std::cout << "Circle r=" << radius
                  << " color=" << color
                  << " at (" << x << "," << y << ")\n";
    }
};

class Rectangle : public Shape {
public:
    int width, height;
    Rectangle(int w, int h) : width(w), height(h) {}
    std::unique_ptr<Shape> clone() const override {
        return std::make_unique<Rectangle>(*this);
    }
    void draw() const override {
        std::cout << "Rect " << width << "x" << height
                  << " at (" << x << "," << y << ")\n";
    }
};

int main() {
    auto proto = std::make_unique<Circle>(50, "red");
    proto->x = 0; proto->y = 0;

    // Clone and customize
    auto c1 = proto->clone(); c1->x = 100; c1->y = 200;
    auto c2 = proto->clone(); c2->x = 300;

    proto->draw(); c1->draw(); c2->draw();
}`,
        python:
`import copy
from typing import Protocol

class Prototype(Protocol):
    def clone(self) -> "Prototype": ...

from dataclasses import dataclass, field

@dataclass
class CharacterStats:
    health: int
    mana: int
    attack: int
    defense: int

@dataclass
class GameCharacter:
    name: str
    character_class: str
    stats: CharacterStats
    skills: list[str] = field(default_factory=list)

    def clone(self) -> "GameCharacter":
        """Deep copy — independent stats and skills."""
        return GameCharacter(
            name=self.name,
            character_class=self.character_class,
            stats=copy.copy(self.stats),   # copy the dataclass
            skills=list(self.skills),       # copy the list
        )

    def __str__(self) -> str:
        return f"{self.name} ({self.character_class}) HP:{self.stats.health} {self.skills}"


class CharacterRegistry:
    def __init__(self) -> None:
        self._prototypes: dict[str, GameCharacter] = {}

    def register(self, key: str, prototype: GameCharacter) -> None:
        self._prototypes[key] = prototype

    def create(self, key: str) -> GameCharacter:
        return self._prototypes[key].clone()


# Usage
warrior_proto = GameCharacter(
    name="Warrior",
    character_class="Fighter",
    stats=CharacterStats(health=200, mana=50, attack=35, defense=40),
    skills=["Shield Bash", "Charge"],
)

registry = CharacterRegistry()
registry.register("warrior", warrior_proto)

w1 = registry.create("warrior"); w1.name = "Guard1"
w2 = registry.create("warrior"); w2.name = "Guard2"
w2.stats.health -= 50   # only affects w2

print(w1)   # HP:200
print(w2)   # HP:150`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Performance** — cloning is faster than re-creating objects with expensive initialization.\n\n**Reduced subclassing** — you don\'t need a Creator hierarchy to build different products; just clone different prototypes.\n\n**Dynamic object types** — you can add new prototypes at runtime without code changes.\n\n**Copy independence** — deep copies give each clone independent state.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Deep copy complexity** — circular references and nested mutable objects make deep cloning difficult.\n\n**Clone interface requirement** — all classes in a hierarchy must implement `clone()` — retrofitting existing classes is painful.\n\n**Hidden state** — cloned objects share state with the prototype until modified; this can cause subtle bugs.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is the difference between shallow copy and deep copy?\n2. When would you use Prototype over Factory Method?\n3. How do you handle circular references when deep copying?\n4. How does JavaScript\'s prototype chain relate to the Prototype pattern?\n5. Design a document template system using the Prototype pattern.' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Shallow when deep is needed** — if the prototype has mutable nested objects, a shallow copy means clones share state and modify each other.\n\n**Not implementing clone recursively** — custom `clone()` must clone all nested objects, not just the outer one.\n\n**Modifying the prototype** — if the prototype is shared and mutable, one clone can corrupt the template for all future clones.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Use a Prototype Registry** — store named prototypes in a map; users request by name and get a fresh clone.\n\n**Make prototypes immutable** — an immutable prototype makes shallow cloning safe.\n\n**Validate the clone** — test that modifying a clone doesn\'t affect the prototype or other clones.' },
    { id: 'summary', title: 'Summary', content: '**Prototype in one line**: clone an existing object instead of creating one from scratch.\n\n**When to use**: expensive object initialization, when you need copies of complex objects, when the concrete type isn\'t known at compile time.\n\n**Key decision**: shallow vs. deep copy — choose based on whether nested state is shared safely.\n\n**Real examples**: Unity Instantiate(), Java Object.clone(), JavaScript Object.create().' },
  ],
};

// ─── STRUCTURAL PATTERNS ─────────────────────────────────────────────────────

export const adapterLesson: Lesson = {
  id: 'lld-adapter',
  title: 'Adapter Pattern',
  description: 'Convert one interface into another that clients expect — making incompatible interfaces work together.',
  difficulty: 'Beginner',
  estimatedMinutes: 10,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Adapter** pattern converts the interface of a class into another interface that clients expect. It lets classes with incompatible interfaces collaborate.\n\nJust like a travel power adapter lets a US plug work in a European socket, a code Adapter wraps an incompatible class and translates its interface.\n\nReal examples: Java\'s `InputStreamReader` (adapts InputStream to Reader), Spring\'s `HandlerAdapter`, and any SDK integration where you wrap a 3rd-party API.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'You have a working `LegacyPaymentProcessor` with a `chargeCard(cardNum, cents)` method. Your new system expects a `PaymentGateway` interface with `pay(amount, currency)`. You can\'t modify the legacy class.\n\nWithout Adapter, you\'d rewrite all client code to call the legacy API — or you\'d duplicate the logic. Adapter wraps the legacy class and translates the new interface calls to the old API.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A travel power adapter lets your US laptop (100–120V plug) work in a European socket (220V, different pin shape). The adapter doesn\'t change the laptop or the socket — it translates between them.\n\nThe Adaptee (European socket) provides the power. The Target (US plug interface) is what your laptop expects. The Adapter sits between them.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Target** — the interface the client uses.\n\n**Adaptee** — the existing class with an incompatible interface.\n\n**Adapter** — wraps the Adaptee; implements the Target interface; translates Target calls to Adaptee calls.\n\n**Two variants**:\n• **Object Adapter** (composition) — holds an instance of the Adaptee; preferred in Java/Python.\n• **Class Adapter** (multiple inheritance) — extends both Target and Adaptee; only possible in C++.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Adapting a legacy payment processor to a new payment gateway interface:',
      codeExamples: {
        java:
`// Target interface — what the new system expects
public interface PaymentGateway {
    boolean pay(double amount, String currency, String cardToken);
    boolean refund(String transactionId, double amount);
}

// Adaptee — legacy class we cannot modify
public class LegacyPaymentProcessor {
    public int chargeCard(String cardNumber, long amountInCents) {
        System.out.printf("Legacy charge: card=%s cents=%d%n", cardNumber, amountInCents);
        return 100000 + (int)(Math.random() * 900000);  // returns transaction ID
    }
    public boolean reverseTransaction(int txnId) {
        System.out.println("Legacy reversal: txn=" + txnId);
        return true;
    }
}

// Adapter — wraps Adaptee, implements Target
public class LegacyPaymentAdapter implements PaymentGateway {
    private final LegacyPaymentProcessor legacy;
    private final Map<String, Integer> txnMap = new HashMap<>();

    public LegacyPaymentAdapter(LegacyPaymentProcessor legacy) {
        this.legacy = legacy;
    }

    @Override
    public boolean pay(double amount, String currency, String cardToken) {
        long cents = Math.round(amount * 100);      // translate amount
        int txnId = legacy.chargeCard(cardToken, cents);
        txnMap.put(cardToken + ":" + amount, txnId); // store for refund
        return txnId > 0;
    }

    @Override
    public boolean refund(String transactionId, double amount) {
        Integer txnId = txnMap.get(transactionId);
        return txnId != null && legacy.reverseTransaction(txnId);
    }
}

// Client — only knows about PaymentGateway
PaymentGateway gateway = new LegacyPaymentAdapter(new LegacyPaymentProcessor());
gateway.pay(49.99, "USD", "tok_visa_4242");`,
        cpp:
`#include <iostream>
#include <unordered_map>
#include <cmath>

// Target interface
class PaymentGateway {
public:
    virtual bool pay(double amount, const std::string& currency,
                     const std::string& cardToken) = 0;
    virtual bool refund(const std::string& txnId, double amount) = 0;
    virtual ~PaymentGateway() = default;
};

// Adaptee — legacy, cannot modify
class LegacyPaymentProcessor {
public:
    int chargeCard(const std::string& card, long cents) {
        std::cout << "Legacy charge: " << card << " " << cents << "¢\n";
        return 100001;
    }
    bool reverseTransaction(int txnId) {
        std::cout << "Reversal: " << txnId << "\n";
        return true;
    }
};

// Object Adapter (composition)
class LegacyPaymentAdapter : public PaymentGateway {
    LegacyPaymentProcessor legacy_;
    std::unordered_map<std::string, int> txnMap_;
public:
    bool pay(double amount, const std::string& currency,
             const std::string& cardToken) override {
        long cents = std::lround(amount * 100);
        int txnId = legacy_.chargeCard(cardToken, cents);
        txnMap_[cardToken] = txnId;
        return txnId > 0;
    }
    bool refund(const std::string& txnId, double amount) override {
        auto it = txnMap_.find(txnId);
        return it != txnMap_.end() && legacy_.reverseTransaction(it->second);
    }
};

int main() {
    LegacyPaymentAdapter gateway;
    gateway.pay(49.99, "USD", "tok_visa_4242");
}`,
        python:
`# Target interface
from abc import ABC, abstractmethod

class PaymentGateway(ABC):
    @abstractmethod
    def pay(self, amount: float, currency: str, card_token: str) -> bool: ...
    @abstractmethod
    def refund(self, transaction_id: str, amount: float) -> bool: ...

# Adaptee — legacy, cannot modify
class LegacyPaymentProcessor:
    def charge_card(self, card_number: str, amount_in_cents: int) -> int:
        print(f"Legacy charge: card={card_number} cents={amount_in_cents}")
        return 100001   # returns transaction ID

    def reverse_transaction(self, txn_id: int) -> bool:
        print(f"Legacy reversal: txn={txn_id}")
        return True

# Adapter — wraps Adaptee, implements Target
class LegacyPaymentAdapter(PaymentGateway):
    def __init__(self, legacy: LegacyPaymentProcessor) -> None:
        self._legacy = legacy
        self._txn_map: dict[str, int] = {}

    def pay(self, amount: float, currency: str, card_token: str) -> bool:
        cents = round(amount * 100)
        txn_id = self._legacy.charge_card(card_token, cents)
        self._txn_map[card_token] = txn_id
        return txn_id > 0

    def refund(self, transaction_id: str, amount: float) -> bool:
        txn_id = self._txn_map.get(transaction_id)
        return txn_id is not None and self._legacy.reverse_transaction(txn_id)

# Client
gateway: PaymentGateway = LegacyPaymentAdapter(LegacyPaymentProcessor())
gateway.pay(49.99, "USD", "tok_visa_4242")`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Reuse legacy code** — wrap without modifying the original class.\n\n**SRP** — the Adapter\'s sole job is translation; it contains no business logic.\n\n**OCP** — add new adapters for new integrations without changing clients.\n\n**Testability** — mock the Target interface in tests without touching the legacy Adaptee.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Extra indirection** — every call goes through the adapter layer.\n\n**Can\'t adapt everything** — if interfaces are fundamentally incompatible (different behavioral contracts, not just syntax), an adapter can\'t bridge the gap.\n\n**Can grow complex** — adapters that translate complex stateful APIs become harder to maintain.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is the difference between Adapter, Decorator, and Facade?\n2. When would you choose Object Adapter vs. Class Adapter?\n3. Design an adapter for a REST API client that must match a local service interface.\n4. How does InputStreamReader in Java implement the Adapter pattern?\n5. What is a "two-way adapter"?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Putting business logic in the Adapter** — the Adapter should only translate; any logic belongs in the service layer.\n\n**Confusing Adapter with Facade** — Adapter changes an interface; Facade simplifies a complex system without changing each class\'s interface.\n\n**Class Adapter in Java** — Java doesn\'t support multiple class inheritance; use Object Adapter (composition) instead.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Prefer composition (Object Adapter)** over inheritance for flexibility.\n\n**Keep adapters thin** — pure translation; zero business logic.\n\n**Test adapters with integration tests** — unit test the client against a mock Target; integration test the Adapter against the real Adaptee.' },
    { id: 'summary', title: 'Summary', content: '**Adapter in one line**: wrap an incompatible class to make it look like what clients expect.\n\n**When to use**: integrating legacy systems, third-party libraries, or any class whose interface you can\'t change.\n\n**Key variants**: Object Adapter (composition, preferred) vs. Class Adapter (multiple inheritance, C++ only).\n\n**Don\'t confuse with**: Facade (simplifies), Decorator (adds behavior).' },
  ],
};

export const decoratorLesson: Lesson = {
  id: 'lld-decorator',
  title: 'Decorator Pattern',
  description: 'Attach additional behaviors to objects dynamically by wrapping them in decorator objects.',
  difficulty: 'Intermediate',
  estimatedMinutes: 12,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Decorator** pattern attaches additional responsibilities to an object dynamically. Decorators provide a flexible alternative to subclassing for extending functionality.\n\nRather than creating `LoggingEmailService extends EmailService` and `RateLimitingLoggingEmailService extends LoggingEmailService`, you wrap objects: `new RateLimiting(new Logging(new EmailService()))`.\n\nReal examples: Java I/O (`new BufferedReader(new InputStreamReader(socket.getInputStream()))`), Python function decorators, middleware stacks in Express/Django.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'You need a coffee with milk, sugar, and whipped cream. Subclassing creates an explosion: MilkCoffee, SugarMilkCoffee, WhipSugarMilkCoffee — 2^N classes for N toppings.\n\nDecorator solves this by wrapping: `new Whip(new Sugar(new Milk(new Coffee())))`. Each wrapper adds one behavior; they can be composed in any order.\n\nThe result: each decorator is a single-responsibility class; combinations are unlimited.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'Clothing layers: you start with a base outfit, then add a sweater (warmth decorator), then a raincoat (waterproof decorator), then a backpack (storage decorator). Each layer adds behavior without modifying the layer beneath it.\n\nYou can layer in any order, combine any set, and add/remove layers at runtime.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Component interface** — the shared interface for both the real object and all decorators.\n\n**ConcreteComponent** — the base object being decorated.\n\n**BaseDecorator** — holds a reference to a Component; delegates all calls to it.\n\n**ConcreteDecorator** — extends BaseDecorator; adds behavior before/after the delegation.\n\n**Transparent wrapping** — client code uses the outermost decorator as if it were the original Component.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Coffee shop: composable beverage decorators:',
      codeExamples: {
        java:
`// Component interface
public interface Beverage {
    String getDescription();
    double getCost();
}

// Concrete component
public class Espresso implements Beverage {
    public String getDescription() { return "Espresso"; }
    public double getCost() { return 1.99; }
}
public class Drip implements Beverage {
    public String getDescription() { return "Drip Coffee"; }
    public double getCost() { return 0.99; }
}

// Base decorator
public abstract class CondimentDecorator implements Beverage {
    protected final Beverage beverage;
    public CondimentDecorator(Beverage beverage) { this.beverage = beverage; }
}

// Concrete decorators
public class Milk extends CondimentDecorator {
    public Milk(Beverage b) { super(b); }
    public String getDescription() { return beverage.getDescription() + ", Milk"; }
    public double getCost() { return beverage.getCost() + 0.25; }
}
public class Sugar extends CondimentDecorator {
    public Sugar(Beverage b) { super(b); }
    public String getDescription() { return beverage.getDescription() + ", Sugar"; }
    public double getCost() { return beverage.getCost() + 0.10; }
}
public class WhippedCream extends CondimentDecorator {
    public WhippedCream(Beverage b) { super(b); }
    public String getDescription() { return beverage.getDescription() + ", Whip"; }
    public double getCost() { return beverage.getCost() + 0.50; }
}

// Usage — compose decorators at runtime
Beverage order = new WhippedCream(new Sugar(new Milk(new Espresso())));
System.out.println(order.getDescription()); // Espresso, Milk, Sugar, Whip
System.out.printf("$%.2f%n", order.getCost());  // $2.84

// Another order — different composition, no new classes
Beverage simple = new Milk(new Drip());
System.out.println(simple.getDescription()); // Drip Coffee, Milk`,
        cpp:
`#include <iostream>
#include <memory>
#include <string>

// Component
class Beverage {
public:
    virtual std::string getDescription() const = 0;
    virtual double getCost() const = 0;
    virtual ~Beverage() = default;
};

// Concrete component
class Espresso : public Beverage {
public:
    std::string getDescription() const override { return "Espresso"; }
    double getCost() const override { return 1.99; }
};

// Base decorator
class CondimentDecorator : public Beverage {
protected:
    std::unique_ptr<Beverage> bev_;
public:
    explicit CondimentDecorator(std::unique_ptr<Beverage> b)
        : bev_(std::move(b)) {}
};

// Concrete decorators
class Milk : public CondimentDecorator {
public:
    explicit Milk(std::unique_ptr<Beverage> b)
        : CondimentDecorator(std::move(b)) {}
    std::string getDescription() const override {
        return bev_->getDescription() + ", Milk";
    }
    double getCost() const override { return bev_->getCost() + 0.25; }
};
class Whip : public CondimentDecorator {
public:
    explicit Whip(std::unique_ptr<Beverage> b)
        : CondimentDecorator(std::move(b)) {}
    std::string getDescription() const override {
        return bev_->getDescription() + ", Whip";
    }
    double getCost() const override { return bev_->getCost() + 0.50; }
};

int main() {
    auto order = std::make_unique<Whip>(
        std::make_unique<Milk>(
            std::make_unique<Espresso>()
        )
    );
    std::cout << order->getDescription() << "\n";   // Espresso, Milk, Whip
    std::cout << "$" << order->getCost() << "\n";   // $2.74
}`,
        python:
`from abc import ABC, abstractmethod

# Component interface
class Beverage(ABC):
    @abstractmethod
    def get_description(self) -> str: ...
    @abstractmethod
    def get_cost(self) -> float: ...

# Concrete component
class Espresso(Beverage):
    def get_description(self) -> str: return "Espresso"
    def get_cost(self) -> float: return 1.99

class DripCoffee(Beverage):
    def get_description(self) -> str: return "Drip Coffee"
    def get_cost(self) -> float: return 0.99

# Base decorator
class CondimentDecorator(Beverage, ABC):
    def __init__(self, beverage: Beverage) -> None:
        self._beverage = beverage

# Concrete decorators
class Milk(CondimentDecorator):
    def get_description(self) -> str:
        return self._beverage.get_description() + ", Milk"
    def get_cost(self) -> float:
        return self._beverage.get_cost() + 0.25

class Sugar(CondimentDecorator):
    def get_description(self) -> str:
        return self._beverage.get_description() + ", Sugar"
    def get_cost(self) -> float:
        return self._beverage.get_cost() + 0.10

class WhippedCream(CondimentDecorator):
    def get_description(self) -> str:
        return self._beverage.get_description() + ", Whip"
    def get_cost(self) -> float:
        return self._beverage.get_cost() + 0.50

# Usage
order: Beverage = WhippedCream(Sugar(Milk(Espresso())))
print(order.get_description())      # Espresso, Milk, Sugar, Whip
print(f"\${order.get_cost():.2f}")   # $2.84`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**No class explosion** — N decorators give N! possible combinations without N! subclasses.\n\n**Single responsibility** — each decorator adds exactly one concern.\n\n**Runtime composition** — add/remove decorators without changing the wrapped object.\n\n**OCP** — add new behavior with a new decorator class; no existing code changes.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Order matters** — `new Logging(new RateLimit(service))` vs `new RateLimit(new Logging(service))` produces different behavior.\n\n**Many small objects** — heavy decoration creates deep chains of small wrapper objects.\n\n**Hard to remove a specific wrapper** — you can\'t easily remove the Milk decorator from the middle of a chain.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. How does Java I/O use the Decorator pattern?\n2. What is the difference between Decorator and Adapter?\n3. What is the difference between Decorator and inheritance?\n4. Design a middleware pipeline using the Decorator pattern.\n5. How does Python\'s @decorator syntax relate to the Decorator pattern?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Forgetting the base decorator** — without BaseDecorator handling delegation, each ConcreteDecorator must implement all interface methods.\n\n**Decorator modifying the wrapped object\'s state** — decorators should be transparent wrappers, not mutators.\n\n**Deep chains without documentation** — three levels of wrapping is fine; ten is a maintenance problem.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Keep decorators small** — one concern per decorator.\n\n**Document expected order** — if order matters (logging must be outermost for timing), document it.\n\n**Consider AOP** — for cross-cutting concerns like logging and security, AOP frameworks (Spring AOP, AspectJ) implement decoration more cleanly.' },
    { id: 'summary', title: 'Summary', content: '**Decorator in one line**: wrap an object to add behavior without subclassing.\n\n**When to use**: adding optional, composable behaviors to objects at runtime.\n\n**Classic example**: Java I/O streams, coffee shop toppings, HTTP middleware.\n\n**Key rule**: decorators and the component implement the same interface — clients can\'t tell the difference.' },
  ],
};

export const facadeLesson: Lesson = {
  id: 'lld-facade',
  title: 'Facade Pattern',
  description: 'Provide a simplified interface to a complex subsystem.',
  difficulty: 'Beginner',
  estimatedMinutes: 10,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Facade** pattern provides a simplified interface to a complex subsystem. It doesn\'t encapsulate the subsystem — it just provides a simpler entry point.\n\nFacade reduces the learning curve for complex APIs, decouples clients from subsystem complexity, and layers the architecture.\n\nReal examples: Java\'s `Files.readAllLines()` (facades FileInputStream + InputStreamReader + BufferedReader), Spring\'s `JdbcTemplate`, and any SDK\'s high-level client.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'To play a movie, your client must: initialize the codec, decompress the video, configure the audio pipeline, sync A/V, and handle buffering — each step using a different subsystem class.\n\nThis couples clients to internal complexity. When the codec changes, all clients break. Facade centralizes these interactions behind a single `VideoPlayer.play(file)` method.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'Calling a restaurant: you say "table for two at 7pm" and it\'s done. Behind the scenes, the maitre d\' (Facade) coordinates the reservations system, table assignment, kitchen prep schedule, and front-of-house staff — you don\'t interact with any of those directly.\n\nThe Facade provides a simple interface to a complex coordinated system.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Facade** — the simple class that clients use; it delegates to subsystem classes.\n\n**Subsystem classes** — the complex classes that do the real work; they remain unchanged.\n\n**Client** — interacts only with the Facade; doesn\'t need to know about subsystem classes.\n\n**Key property**: the Facade doesn\'t hide the subsystem — advanced clients can still access subsystem classes directly if needed.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Home theater facade — simplifies a complex AV subsystem:',
      codeExamples: {
        java:
`// Subsystem classes — complex, low-level
class Amplifier {
    private String name;
    Amplifier(String n) { name = n; }
    void on()              { System.out.println(name + ": ON"); }
    void off()             { System.out.println(name + ": OFF"); }
    void setVolume(int v)  { System.out.println(name + ": volume=" + v); }
    void setInput(String s){ System.out.println(name + ": input=" + s); }
}
class Projector {
    void on()   { System.out.println("Projector: ON"); }
    void off()  { System.out.println("Projector: OFF"); }
    void widescreen() { System.out.println("Projector: widescreen mode"); }
}
class StreamingPlayer {
    void on()        { System.out.println("Player: ON"); }
    void off()       { System.out.println("Player: OFF"); }
    void play(String movie) { System.out.println("Player: playing '" + movie + "'"); }
    void stop()      { System.out.println("Player: STOP"); }
}
class Lights {
    void dim(int level) { System.out.println("Lights: dimmed to " + level + "%"); }
    void on()           { System.out.println("Lights: ON"); }
}

// Facade — unified interface for watch/end movie
public class HomeTheaterFacade {
    private final Amplifier amp;
    private final Projector projector;
    private final StreamingPlayer player;
    private final Lights lights;

    public HomeTheaterFacade(Amplifier amp, Projector p, StreamingPlayer sp, Lights l) {
        this.amp = amp; this.projector = p; this.player = sp; this.lights = l;
    }

    public void watchMovie(String movie) {
        System.out.println("--- Getting ready to watch: " + movie + " ---");
        lights.dim(10);
        amp.on();
        amp.setInput("Streaming");
        amp.setVolume(40);
        projector.on();
        projector.widescreen();
        player.on();
        player.play(movie);
    }

    public void endMovie() {
        System.out.println("--- Shutting down ---");
        player.stop();
        player.off();
        projector.off();
        amp.off();
        lights.on();
    }
}

// Client — simple!
HomeTheaterFacade theater = new HomeTheaterFacade(
    new Amplifier("Yamaha"), new Projector(),
    new StreamingPlayer(), new Lights()
);
theater.watchMovie("Inception");
// ... enjoy the movie ...
theater.endMovie();`,
        cpp:
`#include <iostream>
#include <string>

class Amplifier {
public:
    void on()               { std::cout << "Amp: ON\n"; }
    void setVolume(int v)   { std::cout << "Amp: vol=" << v << "\n"; }
    void off()              { std::cout << "Amp: OFF\n"; }
};
class Projector {
public:
    void on()         { std::cout << "Projector: ON\n"; }
    void widescreen() { std::cout << "Projector: widescreen\n"; }
    void off()        { std::cout << "Projector: OFF\n"; }
};
class StreamingPlayer {
public:
    void on()   { std::cout << "Player: ON\n"; }
    void play(const std::string& m) { std::cout << "Player: playing " << m << "\n"; }
    void stop() { std::cout << "Player: STOP\n"; }
    void off()  { std::cout << "Player: OFF\n"; }
};

class HomeTheaterFacade {
    Amplifier amp_;
    Projector proj_;
    StreamingPlayer player_;
public:
    void watchMovie(const std::string& movie) {
        std::cout << "--- Watch: " << movie << " ---\n";
        amp_.on(); amp_.setVolume(40);
        proj_.on(); proj_.widescreen();
        player_.on(); player_.play(movie);
    }
    void endMovie() {
        std::cout << "--- End ---\n";
        player_.stop(); player_.off();
        proj_.off(); amp_.off();
    }
};

int main() {
    HomeTheaterFacade theater;
    theater.watchMovie("Inception");
    theater.endMovie();
}`,
        python:
`class Amplifier:
    def on(self) -> None:            print("Amp: ON")
    def set_volume(self, v: int) -> None: print(f"Amp: volume={v}")
    def set_input(self, s: str) -> None:  print(f"Amp: input={s}")
    def off(self) -> None:           print("Amp: OFF")

class Projector:
    def on(self) -> None:       print("Projector: ON")
    def widescreen(self) -> None: print("Projector: widescreen")
    def off(self) -> None:      print("Projector: OFF")

class StreamingPlayer:
    def on(self) -> None:              print("Player: ON")
    def play(self, movie: str) -> None: print(f"Player: playing '{movie}'")
    def stop(self) -> None:            print("Player: STOP")
    def off(self) -> None:             print("Player: OFF")

class Lights:
    def dim(self, level: int) -> None: print(f"Lights: {level}%")
    def on(self) -> None:              print("Lights: ON")

# Facade
class HomeTheaterFacade:
    def __init__(self) -> None:
        self._amp    = Amplifier()
        self._proj   = Projector()
        self._player = StreamingPlayer()
        self._lights = Lights()

    def watch_movie(self, movie: str) -> None:
        print(f"--- Getting ready: {movie} ---")
        self._lights.dim(10)
        self._amp.on(); self._amp.set_volume(40); self._amp.set_input("HDMI")
        self._proj.on(); self._proj.widescreen()
        self._player.on(); self._player.play(movie)

    def end_movie(self) -> None:
        print("--- Shutting down ---")
        self._player.stop(); self._player.off()
        self._proj.off(); self._amp.off()
        self._lights.on()

theater = HomeTheaterFacade()
theater.watch_movie("Inception")
theater.end_movie()`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Simplified interface** — clients learn one class instead of many.\n\n**Loose coupling** — client code doesn\'t depend on internal subsystem classes; refactoring the subsystem won\'t break clients.\n\n**Layered architecture** — Facade becomes the API boundary between architectural layers.\n\n**Subsystem still accessible** — advanced clients can bypass the Facade and use subsystem classes directly.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**God object risk** — the Facade can accumulate too many responsibilities over time.\n\n**Feature leakage** — not every subsystem feature can be exposed; clients needing advanced features still have to go deep.\n\n**False simplicity** — if the underlying system is fundamentally complex, the Facade only shifts complexity, not removes it.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is the difference between Facade and Adapter?\n2. What is the difference between Facade and Mediator?\n3. How does Spring\'s JdbcTemplate implement the Facade pattern?\n4. Design a payment processing Facade for Stripe, PayPal, and bank transfers.\n5. When would you choose Facade over just refactoring the subsystem?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Turning Facade into God Class** — add only the most common operations; don\'t replicate every subsystem method.\n\n**Making Facade the only entry point** — the Facade is optional; it should supplement, not gate-keep, the subsystem.\n\n**Confusing Facade with Adapter** — Facade simplifies many classes into one interface; Adapter makes one incompatible interface match another.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Keep the Facade thin** — delegate all real work to the subsystem.\n\n**One facade per bounded context** — a VideoPlayerFacade for AV subsystems, a PaymentFacade for payment subsystems.\n\n**Don\'t prevent subsystem access** — the Facade is a convenience, not a wall.' },
    { id: 'summary', title: 'Summary', content: '**Facade in one line**: one simple class in front of many complex classes.\n\n**When to use**: hiding complexity of subsystems, providing a clean API boundary between architectural layers.\n\n**Key difference from Adapter**: Facade simplifies; Adapter translates.\n\n**Real examples**: JdbcTemplate, Files.readAllLines(), any SDK client class.' },
  ],
};

export const proxyLesson: Lesson = {
  id: 'lld-proxy',
  title: 'Proxy Pattern',
  description: 'Provide a surrogate that controls access to another object.',
  difficulty: 'Intermediate',
  estimatedMinutes: 12,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Proxy** pattern provides a surrogate or placeholder for another object to control access to it. The Proxy implements the same interface as the real subject and intercepts all calls.\n\n**Three main types**: Virtual Proxy (lazy initialization), Protection Proxy (access control), Remote Proxy (network transparency), Caching Proxy.\n\nReal examples: Java\'s dynamic proxies (Spring AOP, Hibernate lazy loading), `java.lang.reflect.Proxy`, service mesh sidecars, and CDN caches.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'Loading a 100MB image for every page render is wasteful — most users never scroll that far. A VirtualProxy loads the image only when it\'s actually displayed.\n\nWithout Proxy, the heavy object is always created eagerly. Proxy intercepts the access and defers creation until the first real call — transparent to the client.\n\nProtection Proxy solves authorization: a `BankAccountProxy` checks user permissions before delegating to the real BankAccount.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A credit card is a Proxy for your bank account. When you pay, the merchant doesn\'t access your bank directly — the card company (Proxy) verifies the transaction, applies security checks, and then accesses the real funds.\n\nYou (client) interact with the card (Proxy) identically to how you\'d interact with cash (RealSubject) — both "pay".' },
    { id: 'how-it-works', title: 'How It Works', content: '**Subject interface** — the common interface for Proxy and RealSubject.\n\n**RealSubject** — the actual object the Proxy delegates to.\n\n**Proxy** — implements Subject; holds a reference to RealSubject; adds behavior before/after delegating.\n\n**Virtual Proxy**: creates RealSubject on first access (lazy loading).\n\n**Protection Proxy**: checks permissions before delegating.\n\n**Caching Proxy**: caches RealSubject results and returns cached data for repeated calls.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Caching + Protection Proxy for a database service:',
      codeExamples: {
        java:
`import java.util.*;

// Subject interface
public interface UserRepository {
    User findById(long id);
    List<User> findAll();
}

// RealSubject — expensive DB calls
public class DatabaseUserRepository implements UserRepository {
    public User findById(long id) {
        System.out.println("DB query: SELECT * FROM users WHERE id=" + id);
        return new User(id, "user_" + id, "user" + id + "@example.com");
    }
    public List<User> findAll() {
        System.out.println("DB query: SELECT * FROM users");
        return List.of(new User(1, "Alice", "alice@example.com"),
                       new User(2, "Bob",   "bob@example.com"));
    }
}

// Caching Proxy
public class CachingUserRepositoryProxy implements UserRepository {
    private final UserRepository delegate;
    private final Map<Long, User> cache = new HashMap<>();
    private List<User> allUsersCache;

    public CachingUserRepositoryProxy(UserRepository delegate) {
        this.delegate = delegate;
    }

    @Override
    public User findById(long id) {
        return cache.computeIfAbsent(id, delegate::findById);
    }

    @Override
    public List<User> findAll() {
        if (allUsersCache == null) {
            allUsersCache = delegate.findAll();
        }
        return allUsersCache;
    }
}

// Protection Proxy
public class AuthenticatedUserRepositoryProxy implements UserRepository {
    private final UserRepository delegate;
    private final String currentUserRole;

    public AuthenticatedUserRepositoryProxy(UserRepository delegate, String role) {
        this.delegate = delegate;
        this.currentUserRole = role;
    }

    @Override
    public User findById(long id) {
        return delegate.findById(id);  // all authenticated users can read
    }

    @Override
    public List<User> findAll() {
        if (!"ADMIN".equals(currentUserRole)) {
            throw new SecurityException("Only admins can list all users");
        }
        return delegate.findAll();
    }
}

// Usage — chain proxies transparently
UserRepository base = new DatabaseUserRepository();
UserRepository cached = new CachingUserRepositoryProxy(base);
UserRepository secured = new AuthenticatedUserRepositoryProxy(cached, "ADMIN");

secured.findById(1);  // DB hit on first call
secured.findById(1);  // cache hit — no DB call
secured.findAll();    // allowed — ADMIN role`,
        cpp:
`#include <iostream>
#include <unordered_map>
#include <memory>
#include <string>
#include <optional>

struct User { long id; std::string name; };

// Subject interface
class UserRepository {
public:
    virtual std::optional<User> findById(long id) = 0;
    virtual ~UserRepository() = default;
};

// RealSubject
class DatabaseRepo : public UserRepository {
public:
    std::optional<User> findById(long id) override {
        std::cout << "DB: SELECT id=" << id << "\n";
        return User{id, "user_" + std::to_string(id)};
    }
};

// Caching Proxy
class CachingProxy : public UserRepository {
    std::unique_ptr<UserRepository> delegate_;
    std::unordered_map<long, User> cache_;
public:
    explicit CachingProxy(std::unique_ptr<UserRepository> d)
        : delegate_(std::move(d)) {}

    std::optional<User> findById(long id) override {
        auto it = cache_.find(id);
        if (it != cache_.end()) {
            std::cout << "Cache hit: id=" << id << "\n";
            return it->second;
        }
        auto user = delegate_->findById(id);
        if (user) cache_[id] = *user;
        return user;
    }
};

int main() {
    auto repo = std::make_unique<CachingProxy>(
        std::make_unique<DatabaseRepo>()
    );
    repo->findById(1);  // DB hit
    repo->findById(1);  // cache hit
    repo->findById(2);  // DB hit
}`,
        python:
`from abc import ABC, abstractmethod
from typing import Optional
from functools import lru_cache

# Subject interface
class UserRepository(ABC):
    @abstractmethod
    def find_by_id(self, user_id: int) -> Optional[dict]: ...

# RealSubject
class DatabaseUserRepository(UserRepository):
    def find_by_id(self, user_id: int) -> Optional[dict]:
        print(f"DB: SELECT * FROM users WHERE id={user_id}")
        return {"id": user_id, "name": f"user_{user_id}"}

# Caching Proxy
class CachingUserRepositoryProxy(UserRepository):
    def __init__(self, delegate: UserRepository) -> None:
        self._delegate = delegate
        self._cache: dict[int, Optional[dict]] = {}

    def find_by_id(self, user_id: int) -> Optional[dict]:
        if user_id not in self._cache:
            self._cache[user_id] = self._delegate.find_by_id(user_id)
        else:
            print(f"Cache hit: id={user_id}")
        return self._cache[user_id]

# Protection Proxy
class AuthenticatedProxy(UserRepository):
    def __init__(self, delegate: UserRepository, role: str) -> None:
        self._delegate = delegate
        self._role = role

    def find_by_id(self, user_id: int) -> Optional[dict]:
        if not self._role:
            raise PermissionError("Authentication required")
        return self._delegate.find_by_id(user_id)

# Usage
repo: UserRepository = AuthenticatedProxy(
    CachingUserRepositoryProxy(DatabaseUserRepository()),
    role="USER"
)
repo.find_by_id(1)  # DB hit
repo.find_by_id(1)  # Cache hit
repo.find_by_id(2)  # DB hit`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Lazy initialization** — create expensive objects only when first needed.\n\n**Access control** — check permissions without modifying the real subject.\n\n**Caching** — return cached results for repeated identical calls.\n\n**Transparent to client** — client doesn\'t know it\'s talking to a proxy.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Indirection** — every call goes through the proxy, adding latency.\n\n**Complexity** — multiple proxy layers (caching + auth + logging) can be hard to trace.\n\n**Response delay** — a remote proxy hides network latency; clients may be surprised by slow calls.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What are the different types of proxies and when would you use each?\n2. How does Spring AOP use dynamic proxies?\n3. How does Hibernate\'s lazy loading use the Virtual Proxy pattern?\n4. What is the difference between Proxy and Decorator?\n5. Design a rate-limiting proxy for an external API client.' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Proxy vs Decorator confusion** — Proxy controls access to the same service; Decorator adds behavior to it. The intent differs.\n\n**Not implementing all interface methods** — a partial proxy that skips some Subject methods breaks transparency.\n\n**Cache invalidation** — caching proxies that don\'t expire stale data introduce consistency bugs.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Chain proxies for multiple concerns** — `Auth(Caching(Real))` composes cleanly.\n\n**Use dynamic proxies for cross-cutting concerns** — Java\'s `java.lang.reflect.Proxy` or CGLIB avoids writing a proxy class per service.\n\n**Always implement the full Subject interface** — the proxy must be a true substitute.' },
    { id: 'summary', title: 'Summary', content: '**Proxy in one line**: an interceptor that controls access to another object.\n\n**Three main types**: Virtual (lazy init), Protection (access control), Caching (result memoization).\n\n**Real examples**: Spring AOP, Hibernate lazy loading, CDN caches, service mesh sidecars.\n\n**Difference from Decorator**: Proxy controls access; Decorator adds behavior.' },
  ],
};

export const compositeLesson: Lesson = {
  id: 'lld-composite',
  title: 'Composite Pattern',
  description: 'Compose objects into tree structures to represent part-whole hierarchies.',
  difficulty: 'Intermediate',
  estimatedMinutes: 12,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Composite** pattern composes objects into tree structures to represent part-whole hierarchies. It lets clients treat individual objects (leaves) and compositions of objects (composites) uniformly.\n\nA file system is the classic example: both a single File and a Directory (which may contain files and sub-directories) have a `size()` method — clients call it the same way on both.\n\nReal examples: file systems, UI component trees (React\'s component tree), organizational charts, and expression trees.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'Without Composite, client code needs two different code paths: one for handling leaf objects and another for traversing container objects. Every operation requires `if (item is Leaf) ... else if (item is Composite) iterate...`.\n\nThis becomes unmaintainable as the hierarchy grows. Composite eliminates the distinction — both Leaf and Composite implement the same interface, so client code is uniform.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A corporate org chart: you can ask both an individual employee and an entire department "what is your total salary cost?". The individual returns their salary; the department recursively sums all employee salaries below it.\n\nThe client (CFO) calls `getSalaryCost()` on any node — individual or department — without knowing which type it is.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Component** — the shared interface for both leaf and composite nodes.\n\n**Leaf** — the base element with no children; implements Component.\n\n**Composite** — a node that can have children; stores child Components; implements Component by delegating to children.\n\n**Client** — works through the Component interface; doesn\'t care if it has a Leaf or a Composite.' },
    {
      id: 'implementation', title: 'Implementation', content: 'File system with uniform size() and display():',
      codeExamples: {
        java:
`import java.util.*;

// Component interface
public interface FileSystemItem {
    String getName();
    long getSize();
    void display(String indent);
}

// Leaf
public class File implements FileSystemItem {
    private final String name;
    private final long sizeBytes;

    public File(String name, long sizeBytes) {
        this.name = name; this.sizeBytes = sizeBytes;
    }
    public String getName()          { return name; }
    public long getSize()            { return sizeBytes; }
    public void display(String indent) {
        System.out.printf("%s📄 %s (%d KB)%n", indent, name, sizeBytes / 1024);
    }
}

// Composite
public class Directory implements FileSystemItem {
    private final String name;
    private final List<FileSystemItem> children = new ArrayList<>();

    public Directory(String name) { this.name = name; }

    public void add(FileSystemItem item)    { children.add(item); }
    public void remove(FileSystemItem item) { children.remove(item); }

    public String getName() { return name; }

    public long getSize() {
        return children.stream().mapToLong(FileSystemItem::getSize).sum();
    }

    public void display(String indent) {
        System.out.printf("%s📁 %s (%d KB total)%n", indent, name, getSize() / 1024);
        for (FileSystemItem child : children) {
            child.display(indent + "   ");
        }
    }
}

// Usage — uniform treatment
Directory root = new Directory("root");
Directory src  = new Directory("src");
Directory test = new Directory("test");

src.add(new File("Main.java",    5_120));
src.add(new File("Service.java", 8_192));
test.add(new File("MainTest.java", 3_000));

root.add(src);
root.add(test);
root.add(new File("README.md", 1_024));

root.display("");                    // recursive display
System.out.println("Total: " + root.getSize() + " bytes");`,
        cpp:
`#include <iostream>
#include <vector>
#include <memory>
#include <numeric>
#include <string>

// Component
class FileSystemItem {
public:
    virtual std::string getName() const = 0;
    virtual long getSize() const = 0;
    virtual void display(const std::string& indent = "") const = 0;
    virtual ~FileSystemItem() = default;
};

// Leaf
class File : public FileSystemItem {
    std::string name_;
    long size_;
public:
    File(std::string n, long s) : name_(std::move(n)), size_(s) {}
    std::string getName() const override { return name_; }
    long getSize() const override { return size_; }
    void display(const std::string& indent) const override {
        std::cout << indent << "📄 " << name_ << " (" << size_/1024 << " KB)\n";
    }
};

// Composite
class Directory : public FileSystemItem {
    std::string name_;
    std::vector<std::unique_ptr<FileSystemItem>> children_;
public:
    explicit Directory(std::string n) : name_(std::move(n)) {}
    void add(std::unique_ptr<FileSystemItem> item) {
        children_.push_back(std::move(item));
    }
    std::string getName() const override { return name_; }
    long getSize() const override {
        return std::accumulate(children_.begin(), children_.end(), 0L,
            [](long sum, const auto& c) { return sum + c->getSize(); });
    }
    void display(const std::string& indent = "") const override {
        std::cout << indent << "📁 " << name_ << " (" << getSize()/1024 << " KB)\n";
        for (const auto& c : children_) c->display(indent + "   ");
    }
};

int main() {
    auto root = std::make_unique<Directory>("root");
    auto src  = std::make_unique<Directory>("src");
    src->add(std::make_unique<File>("Main.cpp",    5120));
    src->add(std::make_unique<File>("Service.cpp", 8192));
    root->add(std::move(src));
    root->add(std::make_unique<File>("README.md", 1024));
    root->display();
}`,
        python:
`from abc import ABC, abstractmethod

# Component interface
class FileSystemItem(ABC):
    @abstractmethod
    def get_name(self) -> str: ...
    @abstractmethod
    def get_size(self) -> int: ...
    @abstractmethod
    def display(self, indent: str = "") -> None: ...

# Leaf
class File(FileSystemItem):
    def __init__(self, name: str, size_bytes: int) -> None:
        self._name = name
        self._size = size_bytes

    def get_name(self) -> str: return self._name
    def get_size(self) -> int: return self._size
    def display(self, indent: str = "") -> None:
        print(f"{indent}📄 {self._name} ({self._size // 1024} KB)")

# Composite
class Directory(FileSystemItem):
    def __init__(self, name: str) -> None:
        self._name = name
        self._children: list[FileSystemItem] = []

    def add(self, item: FileSystemItem) -> None:
        self._children.append(item)

    def remove(self, item: FileSystemItem) -> None:
        self._children.remove(item)

    def get_name(self) -> str: return self._name
    def get_size(self) -> int:
        return sum(child.get_size() for child in self._children)

    def display(self, indent: str = "") -> None:
        print(f"{indent}📁 {self._name} ({self.get_size() // 1024} KB total)")
        for child in self._children:
            child.display(indent + "   ")

# Usage
root = Directory("root")
src = Directory("src")
src.add(File("main.py", 5_120))
src.add(File("service.py", 8_192))
root.add(src)
root.add(File("README.md", 1_024))

root.display()
print(f"Total: {root.get_size()} bytes")`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Uniform treatment** — clients use the same code for leaves and composites.\n\n**Open for extension** — add new component types without changing client code.\n\n**Recursive operations** — `size()`, `print()`, `permissions()` all work recursively with no special client logic.\n\n**Natural for hierarchies** — directly models tree-structured domains (file systems, org charts, UI trees).' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Overly general interface** — making Leaf and Composite share the same interface sometimes means Leaf must implement or stub methods that only make sense for Composite (like `addChild()`).\n\n**Design complexity** — determining what belongs in Component vs Composite vs Leaf requires upfront thought.\n\n**Type safety** — a Composite\'s children are typed as Component, so you need casting to access Composite-specific methods.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. How does Composite handle the case where Leaf doesn\'t support addChild()?\n2. Design a bill-of-materials system using Composite for product assemblies.\n3. How does React\'s virtual DOM use the Composite pattern?\n4. How do you traverse a Composite tree? (DFS vs BFS)\n5. What is the difference between Composite and Decorator?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Putting child management in Component** — `addChild()` and `removeChild()` belong in Composite, not Component, to avoid forcing stubs on Leaf.\n\n**Not handling null children** — composites should gracefully handle empty child lists.\n\n**Deep recursion without guards** — extremely deep trees can cause stack overflow; add a depth limit or use an iterative traversal.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Null Object pattern for leaf children** — return an empty list from `getChildren()` on Leaf instead of null.\n\n**Add parent references carefully** — parent pointers simplify navigation but require careful maintenance on add/remove.\n\n**Cache aggregate values** — memoize `getSize()` if the tree is large and frequently queried.' },
    { id: 'summary', title: 'Summary', content: '**Composite in one line**: treat individual objects and groups uniformly via a shared interface.\n\n**When to use**: tree-structured domains — file systems, UI component trees, org charts.\n\n**Core insight**: the recursive `getSize()` / `display()` pattern works because both Leaf and Composite implement the same interface.\n\n**Real examples**: React component tree, Swing component hierarchy, XML/JSON DOM.' },
  ],
};

export const bridgeLesson: Lesson = {
  id: 'lld-bridge',
  title: 'Bridge Pattern',
  description: 'Decouple an abstraction from its implementation so both can vary independently.',
  difficulty: 'Advanced',
  estimatedMinutes: 14,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Bridge** pattern decouples an abstraction from its implementation so that the two can vary independently. Instead of using inheritance to extend both dimensions, Bridge uses composition.\n\nWithout Bridge, adding a new shape and a new renderer requires a new class for every combination: CircleOpenGL, CircleVulkan, SquareOpenGL, SquareVulkan. Bridge lets you add a new shape OR a new renderer independently.\n\nReal examples: AWT\'s rendering pipeline, JDBC driver architecture, device drivers.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'You have shapes (Circle, Square) that need to be rendered on different platforms (OpenGL, Vulkan, Software). Without Bridge, you get a class for each combination: 2 shapes × 3 renderers = 6 classes. Adding a Triangle means 3 more classes.\n\nBridge separates the two dimensions into independent hierarchies. The Abstraction (Shape) references an Implementor (Renderer) by composition. Adding Triangle is one class; adding a new renderer is one class.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A TV remote control (Abstraction) works with any TV brand (Implementation). The remote has buttons for volume/channel — these translate to different signals for Samsung, LG, or Sony TVs.\n\nYou can build a new remote type (universal remote, smart remote) without changing the TVs. You can add a new TV brand without changing remotes.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Abstraction** — the high-level layer; has a reference to an Implementor; defines the refined interface.\n\n**RefinedAbstraction** — extends Abstraction with more specific behavior.\n\n**Implementor** — the implementation interface; may be completely different from Abstraction.\n\n**ConcreteImplementor** — platform-specific implementations of the Implementor interface.\n\n**Key rule**: Abstraction delegates all heavy lifting to Implementor.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Shape renderer bridge — shapes and renderers vary independently:',
      codeExamples: {
        java:
`// Implementor interface
public interface Renderer {
    void renderCircle(double x, double y, double radius);
    void renderRectangle(double x, double y, double w, double h);
}

// Concrete Implementors
public class OpenGLRenderer implements Renderer {
    public void renderCircle(double x, double y, double r) {
        System.out.printf("[OpenGL] Circle at (%.0f,%.0f) r=%.0f%n", x, y, r);
    }
    public void renderRectangle(double x, double y, double w, double h) {
        System.out.printf("[OpenGL] Rect at (%.0f,%.0f) %.0fx%.0f%n", x, y, w, h);
    }
}
public class VulkanRenderer implements Renderer {
    public void renderCircle(double x, double y, double r) {
        System.out.printf("[Vulkan] Circle at (%.0f,%.0f) r=%.0f%n", x, y, r);
    }
    public void renderRectangle(double x, double y, double w, double h) {
        System.out.printf("[Vulkan] Rect at (%.0f,%.0f) %.0fx%.0f%n", x, y, w, h);
    }
}

// Abstraction
public abstract class Shape {
    protected Renderer renderer;  // the Bridge
    double x, y;

    public Shape(Renderer renderer, double x, double y) {
        this.renderer = renderer; this.x = x; this.y = y;
    }
    public abstract void draw();
    public abstract void resize(double factor);
}

// Refined Abstractions
public class Circle extends Shape {
    private double radius;
    public Circle(Renderer r, double x, double y, double radius) {
        super(r, x, y); this.radius = radius;
    }
    public void draw()                { renderer.renderCircle(x, y, radius); }
    public void resize(double factor) { radius *= factor; }
}
public class Rectangle extends Shape {
    private double width, height;
    public Rectangle(Renderer r, double x, double y, double w, double h) {
        super(r, x, y); this.width = w; this.height = h;
    }
    public void draw()                { renderer.renderRectangle(x, y, width, height); }
    public void resize(double factor) { width *= factor; height *= factor; }
}

// Usage — mix any shape with any renderer
Renderer opengl = new OpenGLRenderer();
Renderer vulkan = new VulkanRenderer();

Shape c1 = new Circle(opengl, 5, 5, 10);
Shape c2 = new Circle(vulkan, 5, 5, 10);
Shape r1 = new Rectangle(opengl, 0, 0, 100, 50);

c1.draw();   // [OpenGL] Circle
c2.draw();   // [Vulkan] Circle
r1.draw();   // [OpenGL] Rect

// Switch renderer at runtime!
((Circle) c1).draw();
c1 = new Circle(vulkan, 5, 5, 10);  // now uses Vulkan`,
        cpp:
`#include <iostream>
#include <memory>

// Implementor
class Renderer {
public:
    virtual void renderCircle(double x, double y, double r) = 0;
    virtual void renderRect(double x, double y, double w, double h) = 0;
    virtual ~Renderer() = default;
};
class OpenGLRenderer : public Renderer {
public:
    void renderCircle(double x, double y, double r) override {
        std::cout << "[OpenGL] Circle (" << x << "," << y << ") r=" << r << "\n";
    }
    void renderRect(double x, double y, double w, double h) override {
        std::cout << "[OpenGL] Rect (" << x << "," << y << ") " << w << "x" << h << "\n";
    }
};

// Abstraction
class Shape {
protected:
    std::shared_ptr<Renderer> renderer_;
    double x_, y_;
public:
    Shape(std::shared_ptr<Renderer> r, double x, double y)
        : renderer_(std::move(r)), x_(x), y_(y) {}
    virtual void draw() = 0;
    virtual ~Shape() = default;
};

class Circle : public Shape {
    double radius_;
public:
    Circle(std::shared_ptr<Renderer> r, double x, double y, double rad)
        : Shape(std::move(r), x, y), radius_(rad) {}
    void draw() override { renderer_->renderCircle(x_, y_, radius_); }
};

int main() {
    auto gl = std::make_shared<OpenGLRenderer>();
    Circle c(gl, 5, 5, 10);
    c.draw();
}`,
        python:
`from abc import ABC, abstractmethod

# Implementor
class Renderer(ABC):
    @abstractmethod
    def render_circle(self, x: float, y: float, radius: float) -> None: ...
    @abstractmethod
    def render_rectangle(self, x: float, y: float, w: float, h: float) -> None: ...

class OpenGLRenderer(Renderer):
    def render_circle(self, x, y, radius):
        print(f"[OpenGL] Circle ({x},{y}) r={radius}")
    def render_rectangle(self, x, y, w, h):
        print(f"[OpenGL] Rect ({x},{y}) {w}x{h}")

class VulkanRenderer(Renderer):
    def render_circle(self, x, y, radius):
        print(f"[Vulkan] Circle ({x},{y}) r={radius}")
    def render_rectangle(self, x, y, w, h):
        print(f"[Vulkan] Rect ({x},{y}) {w}x{h}")

# Abstraction
class Shape(ABC):
    def __init__(self, renderer: Renderer, x: float, y: float) -> None:
        self._renderer = renderer
        self._x = x
        self._y = y

    @abstractmethod
    def draw(self) -> None: ...

class Circle(Shape):
    def __init__(self, renderer: Renderer, x: float, y: float, radius: float) -> None:
        super().__init__(renderer, x, y)
        self._radius = radius

    def draw(self) -> None:
        self._renderer.render_circle(self._x, self._y, self._radius)

class Rectangle(Shape):
    def __init__(self, renderer: Renderer, x: float, y: float, w: float, h: float) -> None:
        super().__init__(renderer, x, y)
        self._w = w; self._h = h

    def draw(self) -> None:
        self._renderer.render_rectangle(self._x, self._y, self._w, self._h)

# Mix freely
Circle(OpenGLRenderer(), 5, 5, 10).draw()
Circle(VulkanRenderer(), 5, 5, 10).draw()
Rectangle(OpenGLRenderer(), 0, 0, 100, 50).draw()`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**No class explosion** — M abstractions × N implementations = M + N classes, not M × N.\n\n**Independent variation** — add new shapes without changing renderers and vice versa.\n\n**Runtime switching** — swap the Implementor at runtime without changing the Abstraction.\n\n**Clean separation** — platform-specific code stays in Implementors; high-level logic stays in Abstractions.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Extra complexity** — for simple cases, Bridge adds indirection without benefit.\n\n**More objects** — both Abstraction and Implementor must be instantiated and wired together.\n\n**Hard to identify upfront** — recognizing when you need a Bridge often requires seeing the class explosion first.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is the difference between Bridge and Strategy?\n2. How does JDBC\'s Driver architecture implement Bridge?\n3. What problem does Bridge solve that Adapter cannot?\n4. Design a notification system (SMS/Email/Push) × (High/Medium/Low priority) using Bridge.\n5. When would you choose Bridge over Abstract Factory?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Confusing Bridge with Adapter** — Bridge is designed upfront to separate two hierarchies; Adapter is applied after to fix an incompatibility.\n\n**Confusing Bridge with Strategy** — Bridge separates abstraction from implementation; Strategy selects an algorithm.\n\n**Over-bridging** — if only one implementation will ever exist, Bridge is unnecessary overhead.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Identify the two varying dimensions early** — Bridge is most powerful when designed upfront, not retrofitted.\n\n**Make the Implementor interface minimal** — keep it narrow; the Abstraction composes from the Implementor\'s primitives.\n\n**Consider Abstract Factory to create pairs** — use a factory to create the right Abstraction+Implementor combination.' },
    { id: 'summary', title: 'Summary', content: '**Bridge in one line**: split a class that varies in two dimensions into two independent hierarchies.\n\n**When to use**: shapes + renderers, messages + channels, UI + platforms — any domain with two orthogonal axes of variation.\n\n**Key formula**: M shapes + N renderers = M + N classes (not M × N).\n\n**JDBC analogy**: `Connection` is the Abstraction; each driver (MySQLDriver, OracleDriver) is a ConcreteImplementor.' },
  ],
};

export const flyweightLesson: Lesson = {
  id: 'lld-flyweight',
  title: 'Flyweight Pattern',
  description: 'Share common state between many fine-grained objects to reduce memory usage.',
  difficulty: 'Advanced',
  estimatedMinutes: 12,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Flyweight** pattern reduces memory usage by sharing as much data as possible with similar objects. It\'s effective when a large number of similar objects consume too much RAM.\n\nFlyweight splits object state into **intrinsic** (shared, immutable) and **extrinsic** (unique per object, passed as context). The shared intrinsic state is stored once in a Flyweight; extrinsic state is supplied by the caller.\n\nReal examples: Java\'s `String.intern()`, character rendering in text editors, particle systems in games, Java\'s `Integer.valueOf()` cache (-128 to 127).' },
    { id: 'problem', title: 'The Problem It Solves', content: 'A text editor with 1 million characters needs 1 million Character objects. Each carries font, size, color, and glyph data — say 1 KB each = 1 GB of RAM.\n\nBut most characters share the same font and glyph data. Flyweight extracts the shared glyph data into one shared CharacterGlyph object per character type, reducing from 1 GB to: (26 glyphs × 1 KB) + (1M chars × 8 bytes position) ≈ 8 MB.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A forest of trees in a game: 10,000 trees share 3 tree types (oak, pine, birch). Each tree type stores the heavy mesh and texture once. Each tree instance only stores its position and scale.\n\nThe tree type is the Flyweight (intrinsic, shared). The position is extrinsic (unique per tree instance).' },
    { id: 'how-it-works', title: 'How It Works', content: '**Intrinsic state** — shared, immutable data stored inside the Flyweight (glyph bitmap, tree mesh+texture).\n\n**Extrinsic state** — context-specific data passed in each operation call (character position, tree position/scale).\n\n**Flyweight interface** — declares operations that accept extrinsic state as parameters.\n\n**FlyweightFactory** — manages a pool of Flyweight instances; returns existing or creates new.\n\n**Context object** — stores extrinsic state; holds a reference to a Flyweight.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Game forest: thousands of trees sharing 3 tree-type flyweights:',
      codeExamples: {
        java:
`import java.util.*;

// Flyweight — stores intrinsic (shared) state
public final class TreeType {
    private final String name;
    private final String color;
    private final String texture;  // heavy data in real use

    public TreeType(String name, String color, String texture) {
        this.name = name; this.color = color; this.texture = texture;
    }
    // Accepts extrinsic state as parameters
    public void draw(int x, int y, double scale) {
        System.out.printf("Draw %s[%s] at (%d,%d) scale=%.1f%n",
            name, color, x, y, scale);
    }
}

// Flyweight Factory — manages the shared pool
public class TreeTypeFactory {
    private static final Map<String, TreeType> pool = new HashMap<>();

    public static TreeType getTreeType(String name, String color, String texture) {
        String key = name + color + texture;
        return pool.computeIfAbsent(key, k -> {
            System.out.println("Creating new TreeType: " + name);
            return new TreeType(name, color, texture);
        });
    }
    public static int getPoolSize() { return pool.size(); }
}

// Context — stores extrinsic (unique) state + reference to flyweight
public class Tree {
    private final int x, y;        // extrinsic
    private final double scale;    // extrinsic
    private final TreeType type;   // intrinsic (shared flyweight)

    public Tree(int x, int y, double scale, TreeType type) {
        this.x = x; this.y = y; this.scale = scale; this.type = type;
    }
    public void draw() { type.draw(x, y, scale); }
}

// Forest — thousands of trees, few flyweights
public class Forest {
    private final List<Tree> trees = new ArrayList<>();

    public void plantTree(int x, int y, double scale,
                          String type, String color, String texture) {
        TreeType flyweight = TreeTypeFactory.getTreeType(type, color, texture);
        trees.add(new Tree(x, y, scale, flyweight));
    }
    public void draw() { trees.forEach(Tree::draw); }
}

// Usage
Forest forest = new Forest();
Random rng = new Random(42);
for (int i = 0; i < 10_000; i++) {
    String type = switch (i % 3) { case 0 -> "Oak"; case 1 -> "Pine"; default -> "Birch"; };
    forest.plantTree(rng.nextInt(1000), rng.nextInt(1000), 0.5 + rng.nextDouble(),
                     type, "green", "bark.png");
}
System.out.println("Tree types in pool: " + TreeTypeFactory.getPoolSize()); // 3, not 10000`,
        cpp:
`#include <iostream>
#include <unordered_map>
#include <vector>
#include <memory>
#include <string>

// Flyweight
class TreeType {
    std::string name_, color_;
public:
    TreeType(std::string n, std::string c)
        : name_(std::move(n)), color_(std::move(c)) {}

    void draw(int x, int y) const {
        std::cout << "Draw " << name_ << "[" << color_ << "] at (" << x << "," << y << ")\n";
    }
};

// Flyweight Factory
class TreeTypeFactory {
    std::unordered_map<std::string, std::shared_ptr<TreeType>> pool_;
public:
    std::shared_ptr<TreeType> get(const std::string& name, const std::string& color) {
        std::string key = name + color;
        auto it = pool_.find(key);
        if (it == pool_.end()) {
            pool_[key] = std::make_shared<TreeType>(name, color);
        }
        return pool_[key];
    }
    size_t size() const { return pool_.size(); }
};

// Context
struct Tree {
    int x, y;
    std::shared_ptr<TreeType> type;
    void draw() const { type->draw(x, y); }
};

int main() {
    TreeTypeFactory factory;
    std::vector<Tree> forest;

    for (int i = 0; i < 1000; ++i) {
        auto type = factory.get(i % 2 == 0 ? "Oak" : "Pine", "green");
        forest.push_back({i * 10, i * 5, type});
    }
    for (const auto& t : forest) t.draw();
    std::cout << "Pool size: " << factory.size() << "\n";  // 2, not 1000
}`,
        python:
`import sys
from dataclasses import dataclass

# Flyweight — intrinsic (shared) state
@dataclass(frozen=True)
class TreeType:
    name: str
    color: str
    texture: str   # heavy asset in real systems

    def draw(self, x: int, y: int, scale: float) -> None:
        print(f"Draw {self.name}[{self.color}] at ({x},{y}) scale={scale:.1f}")

# Flyweight Factory
class TreeTypeFactory:
    _pool: dict[tuple, TreeType] = {}

    @classmethod
    def get(cls, name: str, color: str, texture: str) -> TreeType:
        key = (name, color, texture)
        if key not in cls._pool:
            print(f"Creating TreeType: {name}")
            cls._pool[key] = TreeType(name, color, texture)
        return cls._pool[key]

    @classmethod
    def pool_size(cls) -> int:
        return len(cls._pool)

# Context — extrinsic state
@dataclass
class Tree:
    x: int
    y: int
    scale: float
    tree_type: TreeType  # shared flyweight

    def draw(self) -> None:
        self.tree_type.draw(self.x, self.y, self.scale)

# Usage
import random
forest: list[Tree] = []
rng = random.Random(42)
types = [("Oak", "green", "oak.png"), ("Pine", "dark-green", "pine.png"), ("Birch", "white", "birch.png")]

for _ in range(10_000):
    name, color, tex = rng.choice(types)
    tt = TreeTypeFactory.get(name, color, tex)
    forest.append(Tree(rng.randint(0,999), rng.randint(0,999), 0.5 + rng.random(), tt))

print(f"Trees: {len(forest)}, TreeTypes: {TreeTypeFactory.pool_size()}")  # 10000, 3`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Dramatic memory reduction** — shared intrinsic state eliminates redundant data across thousands of objects.\n\n**Performance** — fewer objects = less GC pressure, better cache locality.\n\n**Transparent** — clients interact with Context objects normally; the flyweight sharing is internal.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Complexity** — separating intrinsic from extrinsic state requires careful design.\n\n**CPU overhead** — extrinsic state must be computed or passed on every operation.\n\n**Not always applicable** — if objects don\'t share significant data, Flyweight provides no benefit.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is the difference between intrinsic and extrinsic state in Flyweight?\n2. How does Java\'s String pool implement Flyweight?\n3. How does Integer.valueOf() use Flyweight?\n4. Design a text editor character rendering system using Flyweight.\n5. How does the Flyweight pattern differ from a simple object pool?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Making flyweights mutable** — if flyweights are mutable, one object\'s change corrupts all sharers.\n\n**Not using a factory** — without a factory, clients create duplicate flyweights defeating the purpose.\n\n**Flyweight for rare objects** — if you only have 5 objects total, flyweight adds complexity with no memory benefit.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Make flyweights immutable** — use final fields in Java, frozen dataclasses in Python, const in C++.\n\n**Always use a factory** — the factory enforces sharing; clients never call `new Flyweight()` directly.\n\n**Profile before applying** — only use Flyweight when profiling shows memory pressure from many similar objects.' },
    { id: 'summary', title: 'Summary', content: '**Flyweight in one line**: share immutable state across thousands of objects to save memory.\n\n**Key split**: intrinsic (shared, in flyweight) vs. extrinsic (unique, passed as parameter).\n\n**When to use**: text rendering, game particles, geographic tiles — anywhere you have huge numbers of similar lightweight objects.\n\n**Real examples**: Java String pool, Integer cache, game tree rendering.' },
  ],
};

// ─── BEHAVIORAL PATTERNS ─────────────────────────────────────────────────────

export const chainOfResponsibilityLesson: Lesson = {
  id: 'lld-chain-of-responsibility',
  title: 'Chain of Responsibility',
  description: 'Pass a request along a chain of handlers until one handles it.',
  difficulty: 'Intermediate',
  estimatedMinutes: 12,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Chain of Responsibility** pattern passes a request along a chain of handlers. Upon receiving a request, each handler decides either to process it or pass it to the next handler.\n\nThis decouples the sender of a request from its receivers — the sender doesn\'t know which handler will process it or even if one will.\n\nReal examples: HTTP middleware (Express/Django), Java\'s `try-catch` chain, GUI event bubbling, approval workflows, and servlet filter chains.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'An HTTP request needs to pass through: authentication, rate limiting, logging, CORS, and then the business handler — in that order. Without CoR, the main handler does all of this in one giant method.\n\nAddition, removal, or reordering of steps requires editing the core handler. CoR lets you compose these steps as a linked chain — each handler does one thing and passes control forward.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A support ticket system: Level 1 support handles simple issues. If it\'s too complex, they escalate to Level 2. Level 2 escalates to Level 3 (engineering). Each level either resolves the ticket or passes it up.\n\nThe ticket sender doesn\'t know who will handle it — just that someone in the chain will.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Handler interface** — declares `handle(request)` and optionally `setNext(handler)`.\n\n**BaseHandler** — implements the linking logic; subclasses override only the handling logic.\n\n**ConcreteHandlers** — check if they can handle the request; if not, call `super.handle()` or `next.handle()`.\n\n**Client** — builds the chain by linking handlers; sends the request to the first handler.\n\n**Termination**: the chain ends when a handler processes the request or there are no more handlers (request unhandled).' },
    {
      id: 'implementation', title: 'Implementation', content: 'HTTP middleware chain: auth → rate limit → logging → business handler:',
      codeExamples: {
        java:
`// Handler interface
public abstract class HttpHandler {
    private HttpHandler next;

    public HttpHandler setNext(HttpHandler next) {
        this.next = next;
        return next;  // enable fluent chaining
    }

    public abstract void handle(HttpRequest request);

    protected void passToNext(HttpRequest request) {
        if (next != null) next.handle(request);
        else System.out.println("No handler could process: " + request.path());
    }
}

// Concrete handlers
public class AuthHandler extends HttpHandler {
    @Override
    public void handle(HttpRequest request) {
        if (request.header("Authorization") == null) {
            System.out.println("AUTH: 401 Unauthorized — " + request.path());
            return;  // stop chain
        }
        System.out.println("AUTH: OK");
        passToNext(request);  // continue chain
    }
}

public class RateLimitHandler extends HttpHandler {
    private final Map<String, Integer> callCount = new HashMap<>();
    private final int maxPerMinute;

    public RateLimitHandler(int maxPerMinute) { this.maxPerMinute = maxPerMinute; }

    @Override
    public void handle(HttpRequest request) {
        String clientId = request.header("X-Client-Id");
        int count = callCount.merge(clientId, 1, Integer::sum);
        if (count > maxPerMinute) {
            System.out.println("RATE: 429 Too Many Requests");
            return;
        }
        System.out.println("RATE: OK (" + count + "/" + maxPerMinute + ")");
        passToNext(request);
    }
}

public class LoggingHandler extends HttpHandler {
    @Override
    public void handle(HttpRequest request) {
        System.out.println("LOG: " + request.method() + " " + request.path());
        passToNext(request);
    }
}

public class BusinessHandler extends HttpHandler {
    @Override
    public void handle(HttpRequest request) {
        System.out.println("HANDLER: Processing " + request.path());
        // real business logic here
    }
}

// Build and use the chain
HttpHandler auth = new AuthHandler();
auth.setNext(new RateLimitHandler(100))
    .setNext(new LoggingHandler())
    .setNext(new BusinessHandler());

auth.handle(new HttpRequest("GET", "/api/users", Map.of(
    "Authorization", "Bearer token", "X-Client-Id", "client1")));`,
        cpp:
`#include <iostream>
#include <memory>
#include <string>
#include <unordered_map>

struct Request { std::string path, auth, clientId; };

// Base handler
class Handler {
protected:
    std::shared_ptr<Handler> next_;
public:
    std::shared_ptr<Handler> setNext(std::shared_ptr<Handler> next) {
        next_ = next; return next;
    }
    virtual void handle(const Request& req) = 0;
    virtual ~Handler() = default;
protected:
    void passToNext(const Request& req) {
        if (next_) next_->handle(req);
        else std::cout << "No handler\n";
    }
};

class AuthHandler : public Handler {
public:
    void handle(const Request& req) override {
        if (req.auth.empty()) { std::cout << "AUTH: 401\n"; return; }
        std::cout << "AUTH: OK\n";
        passToNext(req);
    }
};
class LogHandler : public Handler {
public:
    void handle(const Request& req) override {
        std::cout << "LOG: " << req.path << "\n";
        passToNext(req);
    }
};
class BusinessHandler : public Handler {
public:
    void handle(const Request& req) override {
        std::cout << "HANDLER: " << req.path << "\n";
    }
};

int main() {
    auto auth = std::make_shared<AuthHandler>();
    auto log  = std::make_shared<LogHandler>();
    auto biz  = std::make_shared<BusinessHandler>();
    auth->setNext(log)->setNext(biz);

    Request req{"GET /api/users", "Bearer token", "client1"};
    auth->handle(req);
}`,
        python:
`from __future__ import annotations
from abc import ABC, abstractmethod
from dataclasses import dataclass, field

@dataclass
class HttpRequest:
    method: str
    path: str
    headers: dict[str, str] = field(default_factory=dict)

# Base handler
class Handler(ABC):
    def __init__(self) -> None:
        self._next: Handler | None = None

    def set_next(self, handler: Handler) -> Handler:
        self._next = handler
        return handler   # enable chaining

    @abstractmethod
    def handle(self, request: HttpRequest) -> None: ...

    def _pass_to_next(self, request: HttpRequest) -> None:
        if self._next:
            self._next.handle(request)
        else:
            print(f"No handler for {request.path}")

# Concrete handlers
class AuthHandler(Handler):
    def handle(self, request: HttpRequest) -> None:
        if not request.headers.get("Authorization"):
            print("AUTH: 401 Unauthorized"); return
        print("AUTH: OK")
        self._pass_to_next(request)

class RateLimitHandler(Handler):
    def __init__(self, max_per_minute: int) -> None:
        super().__init__()
        self._max = max_per_minute
        self._counts: dict[str, int] = {}

    def handle(self, request: HttpRequest) -> None:
        client = request.headers.get("X-Client-Id", "anon")
        self._counts[client] = self._counts.get(client, 0) + 1
        if self._counts[client] > self._max:
            print("RATE: 429 Too Many Requests"); return
        print(f"RATE: OK ({self._counts[client]}/{self._max})")
        self._pass_to_next(request)

class LoggingHandler(Handler):
    def handle(self, request: HttpRequest) -> None:
        print(f"LOG: {request.method} {request.path}")
        self._pass_to_next(request)

class BusinessHandler(Handler):
    def handle(self, request: HttpRequest) -> None:
        print(f"HANDLER: Processing {request.path}")

# Build chain
auth = AuthHandler()
auth.set_next(RateLimitHandler(100)).set_next(LoggingHandler()).set_next(BusinessHandler())

req = HttpRequest("GET", "/api/users", {"Authorization": "Bearer tok", "X-Client-Id": "c1"})
auth.handle(req)`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Decoupling** — sender doesn\'t know which handler processes its request.\n\n**Single responsibility** — each handler does one thing.\n\n**Dynamic chain** — add, remove, or reorder handlers at runtime without changing the sender.\n\n**OCP** — add new handlers without modifying existing ones.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**No guaranteed handling** — a request might fall through the chain unhandled.\n\n**Debugging complexity** — tracing which handler processed a request requires logging at each step.\n\n**Performance** — long chains add latency; every request traverses every handler up to the one that handles it.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. How does Express.js middleware implement Chain of Responsibility?\n2. How do you ensure a request is always handled (even if no handler matches)?\n3. What is the difference between Chain of Responsibility and Decorator?\n4. Design an approval workflow (Manager → Director → VP → CEO) using CoR.\n5. How does Java\'s exception handling use Chain of Responsibility?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Forgetting the default handler** — if no handler matches, requests silently disappear; add a catch-all at the end.\n\n**Circular chains** — accidentally linking A → B → A causes infinite loops; validate chain construction.\n\n**Business logic in the chain builder** — the chain builder should only wire handlers; no business decisions.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Always add a terminal handler** — a catch-all that logs unhandled requests prevents silent failures.\n\n**Use fluent setNext()** — returning `next` from setNext enables readable chain construction.\n\n**Log at each step** — add debug logging to see which handler processes each request in production.' },
    { id: 'summary', title: 'Summary', content: '**Chain of Responsibility in one line**: pass a request down a chain; each handler either handles it or forwards it.\n\n**When to use**: middleware pipelines, approval workflows, event bubbling, log level filtering.\n\n**Key property**: the sender doesn\'t know which handler processes its request.\n\n**Real examples**: Express middleware, Servlet filters, Java logging handlers.' },
  ],
};

export const commandLesson: Lesson = {
  id: 'lld-command',
  title: 'Command Pattern',
  description: 'Encapsulate a request as an object to support undoable operations and request queuing.',
  difficulty: 'Intermediate',
  estimatedMinutes: 13,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Command** pattern encapsulates a request as an object, letting you parameterize methods with different requests, queue or log requests, and support undoable operations.\n\nInstead of calling `editor.deleteText(from, to)` directly, you create a `DeleteCommand(editor, from, to)` object that captures the request. This object can be executed, queued, logged, or reversed.\n\nReal examples: undo/redo in text editors, database transaction logs, job queues, macro recording, and GUI button actions.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'A text editor needs undo/redo. Without Command, every operation is a direct method call — there\'s no history to reverse.\n\nCommand wraps each operation as an object with `execute()` and `undo()`. A history stack of Command objects enables: undo (pop + undo()), redo (push + execute()), and replay.\n\nThis also decouples the button that triggers an action (Invoker) from the object that performs it (Receiver).' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A waiter takes your order (Command), writes it on a slip (serializes it), and passes it to the kitchen (Invoker → Receiver). The waiter doesn\'t cook — they just record and forward the request.\n\nThe order slip can be queued, canceled, or replayed (same order next time). This decouples you (Client) from the chef (Receiver).' },
    { id: 'how-it-works', title: 'How It Works', content: '**Command interface** — declares `execute()` and optionally `undo()`.\n\n**ConcreteCommand** — holds a reference to the Receiver + the parameters needed; implements execute/undo by calling Receiver methods.\n\n**Receiver** — the object that actually does the work (the editor, the database).\n\n**Invoker** — stores and executes commands; maintains the history stack for undo/redo.\n\n**Client** — creates ConcreteCommands and sets their Receivers.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Text editor with undo/redo via Command history:',
      codeExamples: {
        java:
`import java.util.*;

// Command interface
public interface Command {
    void execute();
    void undo();
}

// Receiver — the real worker
public class TextEditor {
    private final StringBuilder text = new StringBuilder();

    public void insertText(int pos, String s) {
        text.insert(pos, s);
        System.out.println("Insert '" + s + "' at " + pos + " → \"" + text + "\"");
    }
    public void deleteText(int from, int length) {
        String removed = text.substring(from, from + length);
        text.delete(from, from + length);
        System.out.println("Delete " + length + " chars at " + from + " → \"" + text + "\"");
    }
    public String getText() { return text.toString(); }
}

// Concrete Commands
public class InsertCommand implements Command {
    private final TextEditor editor;
    private final int position;
    private final String text;

    public InsertCommand(TextEditor editor, int pos, String text) {
        this.editor = editor; this.position = pos; this.text = text;
    }
    public void execute() { editor.insertText(position, text); }
    public void undo()    { editor.deleteText(position, text.length()); }
}

public class DeleteCommand implements Command {
    private final TextEditor editor;
    private final int from, length;
    private String deletedText;

    public DeleteCommand(TextEditor editor, int from, int length) {
        this.editor = editor; this.from = from; this.length = length;
    }
    public void execute() {
        deletedText = editor.getText().substring(from, from + length);
        editor.deleteText(from, length);
    }
    public void undo() { editor.insertText(from, deletedText); }
}

// Invoker — history + undo/redo
public class EditorHistory {
    private final Deque<Command> history = new ArrayDeque<>();
    private final Deque<Command> redoStack = new ArrayDeque<>();

    public void execute(Command cmd) {
        cmd.execute();
        history.push(cmd);
        redoStack.clear();  // new command invalidates redo
    }
    public void undo() {
        if (!history.isEmpty()) {
            Command cmd = history.pop();
            cmd.undo();
            redoStack.push(cmd);
        }
    }
    public void redo() {
        if (!redoStack.isEmpty()) {
            Command cmd = redoStack.pop();
            cmd.execute();
            history.push(cmd);
        }
    }
}

// Usage
TextEditor editor = new TextEditor();
EditorHistory history = new EditorHistory();

history.execute(new InsertCommand(editor, 0, "Hello"));
history.execute(new InsertCommand(editor, 5, " World"));
history.undo();   // removes " World"
history.undo();   // removes "Hello"
history.redo();   // re-inserts "Hello"`,
        cpp:
`#include <iostream>
#include <stack>
#include <string>
#include <memory>

// Receiver
class TextEditor {
    std::string text_;
public:
    void insert(int pos, const std::string& s) {
        text_.insert(pos, s);
        std::cout << "Insert '" << s << "' → \"" << text_ << "\"\n";
    }
    void erase(int pos, int len) {
        text_.erase(pos, len);
        std::cout << "Erase " << len << " → \"" << text_ << "\"\n";
    }
    std::string getText() const { return text_; }
};

// Command
class Command {
public:
    virtual void execute() = 0;
    virtual void undo() = 0;
    virtual ~Command() = default;
};

// InsertCommand
class InsertCommand : public Command {
    TextEditor& ed_;
    int pos_;
    std::string text_;
public:
    InsertCommand(TextEditor& e, int p, std::string t)
        : ed_(e), pos_(p), text_(std::move(t)) {}
    void execute() override { ed_.insert(pos_, text_); }
    void undo()    override { ed_.erase(pos_, text_.size()); }
};

// Invoker
class EditorHistory {
    std::stack<std::unique_ptr<Command>> history_;
public:
    void execute(std::unique_ptr<Command> cmd) {
        cmd->execute();
        history_.push(std::move(cmd));
    }
    void undo() {
        if (!history_.empty()) {
            history_.top()->undo();
            history_.pop();
        }
    }
};

int main() {
    TextEditor editor;
    EditorHistory history;
    history.execute(std::make_unique<InsertCommand>(editor, 0, "Hello"));
    history.execute(std::make_unique<InsertCommand>(editor, 5, " World"));
    history.undo();
}`,
        python:
`from abc import ABC, abstractmethod
from collections import deque

# Receiver
class TextEditor:
    def __init__(self) -> None:
        self._text = list("")  # list for easy mutation

    def insert(self, pos: int, text: str) -> None:
        self._text[pos:pos] = list(text)
        print(f"Insert '{text}' at {pos} → \"{''.join(self._text)}\"")

    def delete(self, pos: int, length: int) -> None:
        del self._text[pos:pos + length]
        print(f"Delete {length} chars at {pos} → \"{''.join(self._text)}\"")

    def get_text(self) -> str:
        return "".join(self._text)

# Command interface
class Command(ABC):
    @abstractmethod
    def execute(self) -> None: ...
    @abstractmethod
    def undo(self) -> None: ...

# Concrete commands
class InsertCommand(Command):
    def __init__(self, editor: TextEditor, pos: int, text: str) -> None:
        self._editor = editor; self._pos = pos; self._text = text

    def execute(self) -> None: self._editor.insert(self._pos, self._text)
    def undo(self) -> None:    self._editor.delete(self._pos, len(self._text))

class DeleteCommand(Command):
    def __init__(self, editor: TextEditor, pos: int, length: int) -> None:
        self._editor = editor; self._pos = pos; self._len = length
        self._saved: str = ""

    def execute(self) -> None:
        self._saved = self._editor.get_text()[self._pos:self._pos + self._len]
        self._editor.delete(self._pos, self._len)

    def undo(self) -> None:
        self._editor.insert(self._pos, self._saved)

# Invoker
class EditorHistory:
    def __init__(self) -> None:
        self._history: deque[Command] = deque()
        self._redo:    deque[Command] = deque()

    def execute(self, cmd: Command) -> None:
        cmd.execute(); self._history.append(cmd); self._redo.clear()

    def undo(self) -> None:
        if self._history:
            cmd = self._history.pop(); cmd.undo(); self._redo.append(cmd)

    def redo(self) -> None:
        if self._redo:
            cmd = self._redo.pop(); cmd.execute(); self._history.append(cmd)

editor = TextEditor()
history = EditorHistory()
history.execute(InsertCommand(editor, 0, "Hello"))
history.execute(InsertCommand(editor, 5, " World"))
history.undo()
history.redo()`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Undo/redo** — history of Command objects is all you need.\n\n**Queueing** — Commands can be serialized, queued, and executed later (job queues).\n\n**Composite commands (macros)** — a MacroCommand holds a list of Commands and executes them in sequence.\n\n**Decoupling** — the button (Invoker) doesn\'t know what the command does; only the Command knows.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Class proliferation** — one Command class per operation.\n\n**Memory** — keeping the full history for unlimited undo consumes memory.\n\n**Undo complexity** — some operations (random number generation, time-dependent actions) are hard to undo correctly.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. How does Command enable undo/redo?\n2. What is the difference between Command and Strategy?\n3. Design a job queue system using Command.\n4. How do GUI frameworks (Swing, Qt) use Command for button actions?\n5. What is a Macro Command and how do you implement it?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Not saving undo state** — DeleteCommand must save the deleted text before deleting, or undo is impossible.\n\n**Leaking receiver state** — Commands should be immutable after creation; the receiver\'s state at execute() time determines the outcome.\n\n**Infinite undo history** — cap the history stack to avoid unbounded memory growth.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Capture all state needed for undo at execute() time** — not at Command creation time.\n\n**Use a bounded deque for history** — cap at e.g. 100 levels; drop the oldest.\n\n**Consider serializing Commands** — serializable Commands enable crash recovery (database WAL logs are essentially Command objects).' },
    { id: 'summary', title: 'Summary', content: '**Command in one line**: encapsulate a request as an object with execute() and undo().\n\n**When to use**: undo/redo, job queues, macro recording, transaction logs.\n\n**Key objects**: Command (the request), Invoker (history manager), Receiver (the worker).\n\n**Real examples**: text editor history, database WAL, GUI button actions, task queues.' },
  ],
};

export const iteratorLesson: Lesson = {
  id: 'lld-iterator',
  title: 'Iterator Pattern',
  description: 'Provide a way to sequentially access elements of a collection without exposing its structure.',
  difficulty: 'Beginner',
  estimatedMinutes: 10,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Iterator** pattern provides a way to access elements of an aggregate object sequentially without exposing its underlying representation.\n\nClients can iterate over arrays, linked lists, trees, and graphs using the same `hasNext()` / `next()` interface — without knowing the internal data structure.\n\nReal examples: Java\'s `Iterator<T>` interface, Python\'s `__iter__`/`__next__`, C++\'s range-based for, and all `for-each` constructs.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'Without Iterator, every collection exposes its internal structure: arrays need index-based access, linked lists need pointer traversal, trees need recursive DFS. Client code must change when the underlying data structure changes.\n\nIterator hides this — the client just calls `hasNext()` and `next()` regardless of whether the collection is an array, tree, or remote cursor.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A TV remote\'s channel-up button is an Iterator: you press "next" to see the next channel. You don\'t care whether channels are stored in an array, a database, or a streaming service — the button interface is the same.\n\nThe remote (Iterator) decouples you from the channel list implementation.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Iterator interface** — declares `hasNext()` and `next()` (and optionally `remove()`).\n\n**ConcreteIterator** — implements iteration for a specific collection; tracks current position.\n\n**Aggregate interface** — declares `createIterator()`.\n\n**ConcreteAggregate** — implements `createIterator()` returning its specific iterator.\n\n**External vs Internal**: External iterator — client controls traversal (calls `next()`). Internal iterator — iterator controls traversal (client provides a callback).' },
    {
      id: 'implementation', title: 'Implementation', content: 'Custom binary tree with in-order iterator:',
      codeExamples: {
        java:
`import java.util.*;

// Custom iterator interface (Java's built-in Iterator<T> would also work)
public interface TreeIterator<T> {
    boolean hasNext();
    T next();
}

// Binary Search Tree node
public class TreeNode<T extends Comparable<T>> {
    T value;
    TreeNode<T> left, right;
    TreeNode(T v) { value = v; }
}

// In-order iterator (left → root → right = sorted order for BST)
public class InOrderIterator<T extends Comparable<T>> implements TreeIterator<T> {
    private final Deque<TreeNode<T>> stack = new ArrayDeque<>();

    public InOrderIterator(TreeNode<T> root) {
        pushLeft(root);
    }
    private void pushLeft(TreeNode<T> node) {
        while (node != null) { stack.push(node); node = node.left; }
    }

    public boolean hasNext() { return !stack.isEmpty(); }

    public T next() {
        if (!hasNext()) throw new NoSuchElementException();
        TreeNode<T> node = stack.pop();
        pushLeft(node.right);  // process right subtree
        return node.value;
    }
}

// Aggregate — BST that creates an iterator
public class BinarySearchTree<T extends Comparable<T>> implements Iterable<T> {
    private TreeNode<T> root;

    public void insert(T value) {
        root = insertRec(root, value);
    }
    private TreeNode<T> insertRec(TreeNode<T> node, T value) {
        if (node == null) return new TreeNode<>(value);
        if (value.compareTo(node.value) < 0) node.left = insertRec(node.left, value);
        else if (value.compareTo(node.value) > 0) node.right = insertRec(node.right, value);
        return node;
    }
    // Java's Iterable interface
    public Iterator<T> iterator() {
        InOrderIterator<T> it = new InOrderIterator<>(root);
        return new Iterator<T>() {
            public boolean hasNext() { return it.hasNext(); }
            public T next()          { return it.next(); }
        };
    }
}

// Usage — same for-each as any Java collection
BinarySearchTree<Integer> bst = new BinarySearchTree<>();
bst.insert(5); bst.insert(3); bst.insert(7); bst.insert(1); bst.insert(4);
for (int v : bst) System.out.print(v + " ");  // 1 3 4 5 7 (sorted!)`,
        cpp:
`#include <iostream>
#include <vector>
#include <stack>
#include <optional>

// Simple range iterator over a vector
template<typename T>
class VectorIterator {
    const std::vector<T>& data_;
    size_t index_ = 0;
public:
    explicit VectorIterator(const std::vector<T>& data) : data_(data) {}
    bool hasNext() const { return index_ < data_.size(); }
    const T& next()      { return data_[index_++]; }
};

// Reverse iterator
template<typename T>
class ReverseIterator {
    const std::vector<T>& data_;
    int index_;
public:
    explicit ReverseIterator(const std::vector<T>& data)
        : data_(data), index_((int)data.size() - 1) {}
    bool hasNext() const { return index_ >= 0; }
    const T& next()      { return data_[index_--]; }
};

int main() {
    std::vector<int> nums{1, 2, 3, 4, 5};

    VectorIterator<int> fwd(nums);
    while (fwd.hasNext()) std::cout << fwd.next() << " ";
    std::cout << "\n";

    ReverseIterator<int> rev(nums);
    while (rev.hasNext()) std::cout << rev.next() << " ";
    std::cout << "\n";
}`,
        python:
`from __future__ import annotations
from dataclasses import dataclass
from typing import Generic, TypeVar, Iterator, Optional

T = TypeVar("T")

# Binary Search Tree with custom iterator
@dataclass
class TreeNode(Generic[T]):
    value: T
    left: Optional[TreeNode[T]] = None
    right: Optional[TreeNode[T]] = None

class InOrderIterator(Generic[T]):
    """In-order (sorted) traversal of a BST without recursion."""

    def __init__(self, root: Optional[TreeNode[T]]) -> None:
        self._stack: list[TreeNode[T]] = []
        self._push_left(root)

    def _push_left(self, node: Optional[TreeNode[T]]) -> None:
        while node:
            self._stack.append(node)
            node = node.left

    def __iter__(self) -> Iterator[T]:
        return self

    def __next__(self) -> T:
        if not self._stack:
            raise StopIteration
        node = self._stack.pop()
        self._push_left(node.right)
        return node.value

class BinarySearchTree(Generic[T]):
    def __init__(self) -> None:
        self._root: Optional[TreeNode[T]] = None

    def insert(self, value: T) -> None:
        self._root = self._insert(self._root, value)

    def _insert(self, node: Optional[TreeNode[T]], value: T) -> TreeNode[T]:
        if node is None:
            return TreeNode(value)
        if value < node.value:   # type: ignore
            node.left = self._insert(node.left, value)
        elif value > node.value:  # type: ignore
            node.right = self._insert(node.right, value)
        return node

    def __iter__(self) -> Iterator[T]:
        return InOrderIterator(self._root)

bst: BinarySearchTree[int] = BinarySearchTree()
for v in [5, 3, 7, 1, 4]: bst.insert(v)
print(list(bst))   # [1, 3, 4, 5, 7]`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Uniform interface** — iterate over any collection with the same `hasNext()/next()` contract.\n\n**SRP** — traversal logic lives in the Iterator, not the collection.\n\n**Multiple iterators** — multiple clients can traverse the same collection independently.\n\n**Lazy evaluation** — iterators can generate elements on demand (infinite sequences, database cursors).' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**State overhead** — each iterator holds traversal state; many concurrent iterators use more memory.\n\n**Less efficient than direct access** — for arrays, index-based access is faster than iterator indirection.\n\n**Modification during iteration** — iterating while modifying the collection is unsafe without fail-fast protection.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. How does Java\'s for-each loop use the Iterator pattern?\n2. What is the difference between an internal and external iterator?\n3. Design an iterator for a binary tree (in-order, pre-order, post-order).\n4. How do you handle modification during iteration? (ConcurrentModificationException)\n5. What is a lazy iterator and when would you use one?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Modifying the collection during iteration** — most iterators fail-fast on concurrent modification; use a copy or ConcurrentModificationException-safe approach.\n\n**Not resetting state** — iterators are typically single-use; to iterate again, create a new iterator.\n\n**Skipping the interface** — defining a class with hasNext/next but not implementing Iterator<T> breaks interoperability with for-each.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Implement the language\'s iterator protocol** — Java\'s `Iterator<T>`, Python\'s `__iter__`/`__next__`, C++\'s begin/end.\n\n**Make iterators fail-fast** — detect modification and throw ConcurrentModificationException.\n\n**Use generators for lazy sequences** — Python generators and Java Streams provide lazy iteration without explicit Iterator classes.' },
    { id: 'summary', title: 'Summary', content: '**Iterator in one line**: traverse any collection with hasNext()/next() without knowing its structure.\n\n**When to use**: whenever you need to traverse a custom collection uniformly.\n\n**Real examples**: Java Iterator, Python __iter__, C++ begin/end, database cursor.\n\n**Modern alternative**: use stream/generator APIs for lazy and composable iteration.' },
  ],
};

export const mediatorLesson: Lesson = {
  id: 'lld-mediator',
  title: 'Mediator Pattern',
  description: 'Reduce chaotic dependencies between objects by routing communication through a central mediator.',
  difficulty: 'Intermediate',
  estimatedMinutes: 12,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Mediator** pattern defines an object that encapsulates how a set of objects interact. It promotes loose coupling by keeping objects from referring to each other explicitly and allows you to vary their interaction independently.\n\nInstead of components talking directly to each other (creating an N × N dependency web), they all communicate through a central Mediator.\n\nReal examples: chat room servers, air traffic control systems, UI form controllers, event bus systems, and microservice orchestrators.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'A UI form has a TextBox, CheckBox, Button, and Dropdown. When the checkbox is checked, the dropdown should become enabled; when the textbox is empty, the button should be disabled. With direct coupling, each component references every other component it affects.\n\n5 components with 4 dependencies each = 20 wired connections. Adding a sixth component means wiring it to all 5 others. The Mediator pattern replaces this web with one Mediator that all components talk to.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'An air traffic control tower (Mediator) coordinates all planes (Colleagues). Planes don\'t communicate with each other directly — they all talk to the tower, which decides who lands first, who holds, and who diverts.\n\nThis prevents 50 planes from each directly negotiating with every other plane — which would be chaotic.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Mediator interface** — declares the notification/communication method that Colleagues call.\n\n**ConcreteMediator** — knows all Colleagues; implements the coordination logic.\n\n**Colleague** — each component knows only the Mediator, not other Colleagues.\n\n**Notification flow**: Colleague A fires an event → tells Mediator → Mediator decides which other Colleagues to update.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Chat room mediator — members communicate only through the room:',
      codeExamples: {
        java:
`import java.util.*;

// Mediator interface
public interface ChatRoom {
    void sendMessage(String message, User from, User to);
    void broadcast(String message, User from);
    void userJoined(User user);
    void userLeft(User user);
}

// Colleague
public class User {
    private final String name;
    private final ChatRoom room;

    public User(String name, ChatRoom room) {
        this.name = name; this.room = room;
        room.userJoined(this);
    }
    public String getName() { return name; }

    // Users interact only through the room (Mediator)
    public void send(String message, User to) {
        room.sendMessage(message, this, to);
    }
    public void broadcast(String message) {
        room.broadcast(message, this);
    }

    // Called by the Mediator when a message arrives
    public void receive(String message, String from) {
        System.out.printf("[%s ← %s]: %s%n", name, from, message);
    }
}

// ConcreteMediator
public class ChatRoomImpl implements ChatRoom {
    private final List<User> members = new ArrayList<>();
    private final List<String> history = new ArrayList<>();

    @Override
    public void userJoined(User user) {
        members.add(user);
        broadcast(user.getName() + " has joined the room.", user);
    }
    @Override
    public void userLeft(User user) {
        members.remove(user);
        broadcast(user.getName() + " has left the room.", user);
    }
    @Override
    public void sendMessage(String message, User from, User to) {
        String entry = "[DM " + from.getName() + "→" + to.getName() + "]: " + message;
        history.add(entry);
        to.receive(message, from.getName());
    }
    @Override
    public void broadcast(String message, User from) {
        String entry = "[" + from.getName() + "]: " + message;
        history.add(entry);
        members.stream()
               .filter(u -> u != from)
               .forEach(u -> u.receive(message, from.getName()));
    }
}

// Usage — users never reference each other directly
ChatRoom room = new ChatRoomImpl();
User alice = new User("Alice", room);
User bob   = new User("Bob", room);
User carol = new User("Carol", room);

alice.broadcast("Hello everyone!");
bob.send("Hi Alice, welcome!", alice);`,
        cpp:
`#include <iostream>
#include <vector>
#include <string>
#include <algorithm>

class User;

class ChatRoom {
public:
    virtual void sendMessage(const std::string& msg, User* from, User* to) = 0;
    virtual void broadcast(const std::string& msg, User* from) = 0;
    virtual void join(User* user) = 0;
    virtual ~ChatRoom() = default;
};

class User {
    std::string name_;
    ChatRoom* room_;
public:
    User(std::string n, ChatRoom* r) : name_(std::move(n)), room_(r) { room_->join(this); }
    std::string getName() const { return name_; }
    void send(const std::string& msg, User* to) { room_->sendMessage(msg, this, to); }
    void broadcast(const std::string& msg)       { room_->broadcast(msg, this); }
    void receive(const std::string& msg, const std::string& from) {
        std::cout << "[" << name_ << " ← " << from << "]: " << msg << "\n";
    }
};

class ChatRoomImpl : public ChatRoom {
    std::vector<User*> members_;
public:
    void join(User* u) override { members_.push_back(u); }
    void sendMessage(const std::string& msg, User* from, User* to) override {
        to->receive(msg, from->getName());
    }
    void broadcast(const std::string& msg, User* from) override {
        for (auto* u : members_) if (u != from) u->receive(msg, from->getName());
    }
};

int main() {
    ChatRoomImpl room;
    User alice("Alice", &room), bob("Bob", &room);
    alice.broadcast("Hello everyone!");
    bob.send("Hi Alice!", &alice);
}`,
        python:
`from __future__ import annotations
from abc import ABC, abstractmethod

class ChatRoom(ABC):
    @abstractmethod
    def send_message(self, message: str, sender: "User", recipient: "User") -> None: ...
    @abstractmethod
    def broadcast(self, message: str, sender: "User") -> None: ...
    @abstractmethod
    def user_joined(self, user: "User") -> None: ...

class User:
    def __init__(self, name: str, room: ChatRoom) -> None:
        self.name = name
        self._room = room
        room.user_joined(self)

    def send(self, message: str, to: "User") -> None:
        self._room.send_message(message, self, to)

    def broadcast(self, message: str) -> None:
        self._room.broadcast(message, self)

    def receive(self, message: str, from_name: str) -> None:
        print(f"[{self.name} ← {from_name}]: {message}")

class ChatRoomImpl(ChatRoom):
    def __init__(self) -> None:
        self._members: list[User] = []

    def user_joined(self, user: User) -> None:
        self._members.append(user)
        self.broadcast(f"{user.name} joined.", user)

    def send_message(self, message: str, sender: User, recipient: User) -> None:
        recipient.receive(message, sender.name)

    def broadcast(self, message: str, sender: User) -> None:
        for member in self._members:
            if member is not sender:
                member.receive(message, sender.name)

room = ChatRoomImpl()
alice = User("Alice", room)
bob   = User("Bob", room)
carol = User("Carol", room)

alice.broadcast("Hello everyone!")
bob.send("Hey Alice!", alice)`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Reduced coupling** — components don\'t need references to each other.\n\n**Centralized control** — all interaction logic is in one place, easy to audit and modify.\n\n**Reusable components** — components can be reused in different mediators since they have no direct peer dependencies.\n\n**Single place to add cross-cutting behavior** — logging, rate limiting, and filtering apply in the Mediator.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**God Mediator** — the Mediator can become a monolith that knows everything and does everything.\n\n**Single point of failure** — if the Mediator fails or is overwhelmed, all communication fails.\n\n**Hard to test** — the Mediator\'s coordination logic can be complex to unit test.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is the difference between Mediator and Observer?\n2. How does a chat room implement the Mediator pattern?\n3. How do you prevent the Mediator from becoming a God Class?\n4. Design a flight booking system coordinator using Mediator.\n5. How does an event bus differ from a Mediator?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Making the Mediator know Colleague internals** — the Mediator should communicate through Colleague interfaces, not reach into their fields.\n\n**One Mediator for everything** — use multiple focused Mediators (one per bounded context) instead of one global one.\n\n**Confusing Mediator with Observer** — in Observer, the Subject broadcasts to all Observers; in Mediator, the Mediator has fine-grained control over who gets what.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Keep the Mediator focused** — one Mediator per domain interaction (UI, chat room, workflow). Don\'t create a global super-mediator.\n\n**Define a narrow Colleague interface** — Colleagues should only know how to "notify the Mediator", not understand Mediator internals.\n\n**Consider an event bus for large systems** — for many components, a publish/subscribe event bus is a more scalable form of mediation.' },
    { id: 'summary', title: 'Summary', content: '**Mediator in one line**: replace a web of direct component-to-component dependencies with one central coordinator.\n\n**When to use**: many-to-many interactions between components (chat rooms, form controllers, trading desks).\n\n**Key trade-off**: reduces coupling between components but concentrates complexity in the Mediator.\n\n**Real examples**: air traffic control, chat room server, event bus, UI form logic.' },
  ],
};

export const mementoLesson: Lesson = {
  id: 'lld-memento',
  title: 'Memento Pattern',
  description: 'Capture and restore an object\'s internal state without violating encapsulation.',
  difficulty: 'Intermediate',
  estimatedMinutes: 10,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Memento** pattern captures an object\'s internal state and stores it externally so the object can be restored to that state later — without violating encapsulation.\n\nUnlike Command (which undoes by re-applying the inverse operation), Memento takes a snapshot of the full state and restores it directly.\n\nReal examples: text editor "undo" (full state snapshots), browser history, game save points, database transaction rollback, and version control.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'A game character has 50 fields: health, position, inventory, skills, quest state, etc. You want to implement "quicksave" — save the full game state and restore it later.\n\nBut exposing all fields to an external saver violates encapsulation. Memento solves this: the character creates a Memento (opaque state capsule), the Caretaker stores it, and later the character restores from the Memento without anyone else reading its internals.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A photograph captures a scene at a specific moment. You can "restore" the room to look like the photo by rearranging everything. The photo (Memento) holds the state; you (Originator) restore from it.\n\nOther people can hold the photo without being able to read every pixel\'s exact meaning — the photo is opaque to them.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Originator** — the object whose state we want to save. Creates Mementos via `save()` and restores from them via `restore(Memento)`.\n\n**Memento** — stores the Originator\'s state. The Originator can read it; other classes cannot (opaque).\n\n**Caretaker** — stores and retrieves Mementos; doesn\'t operate on or inspect the Memento\'s contents.\n\n**Undo stack**: push `save()` result before each operation; call `restore(stack.pop())` to undo.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Text editor with snapshot-based undo using Memento:',
      codeExamples: {
        java:
`import java.util.*;

// Memento — immutable state capsule; private fields = opaque
public final class EditorMemento {
    private final String text;
    private final int cursorPos;
    private final int selectionStart;

    // Only the Editor can create and read Mementos
    EditorMemento(String text, int cursorPos, int selectionStart) {
        this.text = text; this.cursorPos = cursorPos; this.selectionStart = selectionStart;
    }
    String getText()           { return text; }
    int getCursorPos()         { return cursorPos; }
    int getSelectionStart()    { return selectionStart; }
}

// Originator — the actual editor
public class TextEditor {
    private StringBuilder text   = new StringBuilder();
    private int cursorPos         = 0;
    private int selectionStart    = -1;

    public void type(String chars) {
        text.insert(cursorPos, chars);
        cursorPos += chars.length();
    }
    public void moveCursor(int pos) { cursorPos = Math.min(pos, text.length()); }
    public String getText()         { return text.toString(); }

    // Create a snapshot
    public EditorMemento save() {
        return new EditorMemento(text.toString(), cursorPos, selectionStart);
    }
    // Restore from snapshot
    public void restore(EditorMemento memento) {
        text           = new StringBuilder(memento.getText());
        cursorPos      = memento.getCursorPos();
        selectionStart = memento.getSelectionStart();
        System.out.println("Restored: \"" + text + "\" cursor=" + cursorPos);
    }
}

// Caretaker — manages the undo stack
public class UndoManager {
    private final Deque<EditorMemento> stack = new ArrayDeque<>();

    public void save(TextEditor editor) { stack.push(editor.save()); }
    public void undo(TextEditor editor) {
        if (!stack.isEmpty()) editor.restore(stack.pop());
        else System.out.println("Nothing to undo");
    }
}

// Usage
TextEditor editor = new TextEditor();
UndoManager undo  = new UndoManager();

undo.save(editor);      // save empty state
editor.type("Hello");
undo.save(editor);      // save "Hello"
editor.type(" World");
System.out.println("Current: \"" + editor.getText() + "\"");

undo.undo(editor);      // → "Hello"
undo.undo(editor);      // → ""`,
        cpp:
`#include <iostream>
#include <string>
#include <stack>

// Memento
class EditorMemento {
    std::string text_;
    int cursor_;
    friend class TextEditor;  // only Editor can read internals
    EditorMemento(std::string t, int c) : text_(std::move(t)), cursor_(c) {}
public:
    // No public getters — opaque to Caretaker
};

// Originator
class TextEditor {
    std::string text_;
    int cursor_ = 0;
public:
    void type(const std::string& s) {
        text_.insert(cursor_, s); cursor_ += s.size();
    }
    std::string getText() const { return text_; }

    EditorMemento save() const { return EditorMemento(text_, cursor_); }
    void restore(const EditorMemento& m) {
        text_  = m.text_;
        cursor_= m.cursor_;
        std::cout << "Restored: \"" << text_ << "\"\n";
    }
};

// Caretaker
class UndoManager {
    std::stack<EditorMemento> stack_;
public:
    void save(const TextEditor& ed)   { stack_.push(ed.save()); }
    void undo(TextEditor& ed) {
        if (!stack_.empty()) { ed.restore(stack_.top()); stack_.pop(); }
    }
};

int main() {
    TextEditor editor;
    UndoManager undo;
    undo.save(editor);
    editor.type("Hello");
    undo.save(editor);
    editor.type(" World");
    std::cout << "Current: \"" << editor.getText() << "\"\n";
    undo.undo(editor);  // → "Hello"
    undo.undo(editor);  // → ""
}`,
        python:
`from dataclasses import dataclass
from collections import deque

# Memento — immutable snapshot
@dataclass(frozen=True)
class EditorMemento:
    text: str
    cursor_pos: int

# Originator
class TextEditor:
    def __init__(self) -> None:
        self._text = ""
        self._cursor = 0

    def type(self, chars: str) -> None:
        self._text = self._text[:self._cursor] + chars + self._text[self._cursor:]
        self._cursor += len(chars)

    def get_text(self) -> str:
        return self._text

    def save(self) -> EditorMemento:
        return EditorMemento(self._text, self._cursor)

    def restore(self, memento: EditorMemento) -> None:
        self._text   = memento.text
        self._cursor = memento.cursor_pos
        print(f'Restored: "{self._text}" cursor={self._cursor}')

# Caretaker
class UndoManager:
    def __init__(self) -> None:
        self._stack: deque[EditorMemento] = deque()

    def save(self, editor: TextEditor) -> None:
        self._stack.append(editor.save())

    def undo(self, editor: TextEditor) -> None:
        if self._stack:
            editor.restore(self._stack.pop())
        else:
            print("Nothing to undo")

# Usage
editor = TextEditor()
undo = UndoManager()

undo.save(editor)
editor.type("Hello")
undo.save(editor)
editor.type(" World")
print(f'Current: "{editor.get_text()}"')

undo.undo(editor)   # → "Hello"
undo.undo(editor)   # → ""`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Encapsulation** — internal state is captured and restored without exposing private fields.\n\n**Simple undo** — push before each action; pop to undo. No inverse-operation math required.\n\n**Snapshots** — full state capture enables "go to any point in history".\n\n**Separation of concerns** — the Originator handles state; the Caretaker handles history storage.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Memory** — full state snapshots are expensive for large objects. Command pattern\'s delta-based approach is more memory efficient.\n\n**Deep copy complexity** — if state includes nested objects, saving requires deep copying.\n\n**Stale Mementos** — if the Originator\'s structure changes, old Mementos may be incompatible.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is the difference between Memento and Command for undo/redo?\n2. How do you handle memory limits when storing many Mementos?\n3. Design a version control system using Memento.\n4. How do you implement redo on top of a Memento-based undo?\n5. How does database rollback relate to Memento?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Exposing Memento internals** — the Caretaker should be unable to read the Memento\'s contents; only the Originator should.\n\n**Shallow snapshots** — if the state includes mutable objects, shallow copy of the state leaves the Memento vulnerable to modification.\n\n**Unbounded history** — cap the undo stack to prevent memory leaks.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Make Mementos immutable** — frozen dataclass in Python, final fields in Java.\n\n**Limit undo depth** — cap the stack (e.g., 50 levels); drop the oldest when the cap is reached.\n\n**Consider incremental snapshots** — for large states, store only the delta (changed fields) rather than the full state.' },
    { id: 'summary', title: 'Summary', content: '**Memento in one line**: snapshot the full state; restore from it later, without exposing internals.\n\n**When to use**: undo/redo (full state), game saves, browser history, transaction rollback.\n\n**vs. Command**: Memento stores the full state; Command stores the operation (inverse). Memento is simpler; Command is more memory efficient.\n\n**Key encapsulation rule**: Caretaker stores Mementos; only Originator reads them.' },
  ],
};

export const stateLesson: Lesson = {
  id: 'lld-state',
  title: 'State Pattern',
  description: 'Allow an object to alter its behavior when its internal state changes — it will appear to change its class.',
  difficulty: 'Intermediate',
  estimatedMinutes: 12,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **State** pattern allows an object to change its behavior when its internal state changes. The object will appear to change its class.\n\nInstead of giant `if/switch` statements that check a state field, each state is its own class with its own behavior. The context delegates all behavior to the current state object.\n\nReal examples: TCP connection states (CLOSED, LISTEN, SYN_SENT, ESTABLISHED), vending machine states, order status machines, and traffic light controllers.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'A vending machine has states: Idle, HasCoin, OutOfStock. Every method (`insertCoin()`, `pressButton()`, `dispense()`) has a switch statement on the current state.\n\nAdding a new state (e.g., Maintenance mode) means editing every switch in every method. The State pattern replaces these switches with state objects, each handling all methods for that state.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A traffic light cycles through Red → Green → Yellow → Red. Each "color" (State) has its own behavior: Red means stop, Green means go, Yellow means slow down.\n\nThe intersection (Context) has a current light state. When the timer fires (transition), it swaps to the next state. The intersection\'s behavior changes with the state, but the intersection object stays the same.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Context** — holds a reference to the current State object; delegates operations to it; provides a `setState()` method.\n\n**State interface** — declares all operations that vary by state.\n\n**ConcreteState** — implements behavior for one state; can trigger state transitions by calling `context.setState(newState)`.\n\n**Transitions** — triggered by context events; ConcreteState decides when to transition and to which state.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Order state machine: Pending → Processing → Shipped → Delivered:',
      codeExamples: {
        java:
`// State interface
public interface OrderState {
    void confirm(Order order);
    void ship(Order order);
    void deliver(Order order);
    void cancel(Order order);
    String getStatusName();
}

// Concrete states
public class PendingState implements OrderState {
    public void confirm(Order order) {
        System.out.println("Order confirmed → Processing");
        order.setState(new ProcessingState());
    }
    public void ship(Order order) { System.out.println("Cannot ship — not confirmed"); }
    public void deliver(Order order) { System.out.println("Cannot deliver — not shipped"); }
    public void cancel(Order order) {
        System.out.println("Order cancelled");
        order.setState(new CancelledState());
    }
    public String getStatusName() { return "PENDING"; }
}
public class ProcessingState implements OrderState {
    public void confirm(Order order) { System.out.println("Already confirmed"); }
    public void ship(Order order) {
        System.out.println("Order shipped → Shipped");
        order.setState(new ShippedState());
    }
    public void deliver(Order order) { System.out.println("Not shipped yet"); }
    public void cancel(Order order) {
        System.out.println("Order cancelled");
        order.setState(new CancelledState());
    }
    public String getStatusName() { return "PROCESSING"; }
}
public class ShippedState implements OrderState {
    public void confirm(Order order) { System.out.println("Already confirmed"); }
    public void ship(Order order)    { System.out.println("Already shipped"); }
    public void deliver(Order order) {
        System.out.println("Order delivered → Delivered");
        order.setState(new DeliveredState());
    }
    public void cancel(Order order) { System.out.println("Cannot cancel — already shipped"); }
    public String getStatusName() { return "SHIPPED"; }
}
public class DeliveredState implements OrderState {
    public void confirm(Order order) { System.out.println("Already delivered"); }
    public void ship(Order order)    { System.out.println("Already delivered"); }
    public void deliver(Order order) { System.out.println("Already delivered"); }
    public void cancel(Order order)  { System.out.println("Cannot cancel — delivered"); }
    public String getStatusName()    { return "DELIVERED"; }
}
public class CancelledState implements OrderState {
    public void confirm(Order order) { System.out.println("Order is cancelled"); }
    public void ship(Order order)    { System.out.println("Order is cancelled"); }
    public void deliver(Order order) { System.out.println("Order is cancelled"); }
    public void cancel(Order order)  { System.out.println("Already cancelled"); }
    public String getStatusName()    { return "CANCELLED"; }
}

// Context
public class Order {
    private OrderState state = new PendingState();
    private final String orderId;

    public Order(String orderId) { this.orderId = orderId; }
    public void setState(OrderState state) { this.state = state; }
    public String getStatus() { return state.getStatusName(); }

    // Delegate to current state
    public void confirm() { state.confirm(this); }
    public void ship()    { state.ship(this); }
    public void deliver() { state.deliver(this); }
    public void cancel()  { state.cancel(this); }
}

// Usage
Order order = new Order("ORD-001");
System.out.println(order.getStatus()); // PENDING
order.confirm();
System.out.println(order.getStatus()); // PROCESSING
order.ship();
order.deliver();
System.out.println(order.getStatus()); // DELIVERED
order.cancel(); // Cannot cancel — delivered`,
        cpp:
`#include <iostream>
#include <memory>
#include <string>

class Order;

class OrderState {
public:
    virtual void confirm(Order& o) = 0;
    virtual void ship(Order& o) = 0;
    virtual void deliver(Order& o) = 0;
    virtual std::string name() const = 0;
    virtual ~OrderState() = default;
};

class PendingState : public OrderState {
public:
    void confirm(Order& o) override;
    void ship(Order& o) override    { std::cout << "Not confirmed\n"; }
    void deliver(Order& o) override { std::cout << "Not shipped\n"; }
    std::string name() const override { return "PENDING"; }
};
class ProcessingState : public OrderState {
public:
    void confirm(Order& o) override { std::cout << "Already confirmed\n"; }
    void ship(Order& o) override;
    void deliver(Order& o) override { std::cout << "Not shipped\n"; }
    std::string name() const override { return "PROCESSING"; }
};
class ShippedState : public OrderState {
public:
    void confirm(Order& o) override { std::cout << "Confirmed\n"; }
    void ship(Order& o) override    { std::cout << "Already shipped\n"; }
    void deliver(Order& o) override;
    std::string name() const override { return "SHIPPED"; }
};

class Order {
    std::unique_ptr<OrderState> state_;
public:
    Order() : state_(std::make_unique<PendingState>()) {}
    void setState(std::unique_ptr<OrderState> s) { state_ = std::move(s); }
    void confirm() { state_->confirm(*this); }
    void ship()    { state_->ship(*this); }
    void deliver() { state_->deliver(*this); }
    std::string getStatus() const { return state_->name(); }
};

void PendingState::confirm(Order& o) {
    std::cout << "Confirmed → Processing\n";
    o.setState(std::make_unique<ProcessingState>());
}
void ProcessingState::ship(Order& o) {
    std::cout << "Shipped\n";
    o.setState(std::make_unique<ShippedState>());
}
void ShippedState::deliver(Order& o) {
    std::cout << "Delivered\n";
    // o.setState(std::make_unique<DeliveredState>());
}

int main() {
    Order order;
    order.confirm(); order.ship(); order.deliver();
}`,
        python:
`from __future__ import annotations
from abc import ABC, abstractmethod

class OrderState(ABC):
    @abstractmethod
    def confirm(self, order: Order) -> None: ...
    @abstractmethod
    def ship(self, order: Order) -> None: ...
    @abstractmethod
    def deliver(self, order: Order) -> None: ...
    @abstractmethod
    def cancel(self, order: Order) -> None: ...
    @abstractmethod
    def name(self) -> str: ...

class PendingState(OrderState):
    def confirm(self, order: Order) -> None:
        print("Confirmed → Processing"); order.set_state(ProcessingState())
    def ship(self, o): print("Not confirmed yet")
    def deliver(self, o): print("Not shipped yet")
    def cancel(self, order: Order) -> None:
        print("Cancelled"); order.set_state(CancelledState())
    def name(self) -> str: return "PENDING"

class ProcessingState(OrderState):
    def confirm(self, o): print("Already confirmed")
    def ship(self, order: Order) -> None:
        print("Shipped → Shipped"); order.set_state(ShippedState())
    def deliver(self, o): print("Not shipped yet")
    def cancel(self, order: Order) -> None:
        print("Cancelled"); order.set_state(CancelledState())
    def name(self) -> str: return "PROCESSING"

class ShippedState(OrderState):
    def confirm(self, o): print("Already shipped")
    def ship(self, o):    print("Already shipped")
    def deliver(self, order: Order) -> None:
        print("Delivered!"); order.set_state(DeliveredState())
    def cancel(self, o): print("Cannot cancel — shipped")
    def name(self) -> str: return "SHIPPED"

class DeliveredState(OrderState):
    def confirm(self, o): print("Delivered")
    def ship(self, o):    print("Delivered")
    def deliver(self, o): print("Already delivered")
    def cancel(self, o):  print("Cannot cancel — delivered")
    def name(self) -> str: return "DELIVERED"

class CancelledState(OrderState):
    def confirm(self, o): print("Cancelled")
    def ship(self, o):    print("Cancelled")
    def deliver(self, o): print("Cancelled")
    def cancel(self, o):  print("Already cancelled")
    def name(self) -> str: return "CANCELLED"

class Order:
    def __init__(self) -> None:
        self._state: OrderState = PendingState()

    def set_state(self, state: OrderState) -> None:
        self._state = state

    def status(self) -> str: return self._state.name()
    def confirm(self) -> None: self._state.confirm(self)
    def ship(self)    -> None: self._state.ship(self)
    def deliver(self) -> None: self._state.deliver(self)
    def cancel(self)  -> None: self._state.cancel(self)

order = Order()
print(order.status())   # PENDING
order.confirm()
order.ship()
order.deliver()
print(order.status())   # DELIVERED`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**No switch explosion** — each state handles its own behavior; no giant if/switch blocks.\n\n**SRP** — each state class has one responsibility.\n\n**OCP** — add new states without modifying existing states or the Context.\n\n**Explicit state model** — the state machine is visible in the class hierarchy rather than buried in conditionals.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Class proliferation** — one class per state; a 10-state machine needs 10+ classes.\n\n**Circular dependencies** — states need to reference the Context to trigger transitions.\n\n**Overkill for few states** — if an object has 2 states, a simple boolean flag may be clearer than 2 state classes.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is the difference between State and Strategy?\n2. How does TCP/IP connection management use the State pattern?\n3. Design a vending machine state machine.\n4. How do you handle invalid state transitions?\n5. What is the difference between State and a finite state machine (FSM)?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**State holding business data** — State objects should be behavior-only; data belongs in the Context.\n\n**Not handling invalid transitions** — each state must explicitly handle (or reject) every possible event, even if it does nothing.\n\n**Global state objects** — if State objects are stateless, share them as singletons; if stateful, create a new instance per context.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Document the state diagram first** — draw boxes (states) and arrows (transitions) before writing any code.\n\n**Make State objects stateless when possible** — stateless State objects can be shared across Contexts.\n\n**Throw on invalid transitions** — explicit IllegalStateException is better than silent no-ops for unreachable states.' },
    { id: 'summary', title: 'Summary', content: '**State in one line**: each state of an object becomes a class; the object delegates behavior to its current state.\n\n**When to use**: objects that behave differently based on internal state — FSMs, protocol handlers, order workflows.\n\n**vs. Strategy**: Strategy chooses a behavior; State changes behavior automatically when internal state changes.\n\n**Real examples**: TCP states, order status, vending machine, traffic lights.' },
  ],
};

export const templateMethodLesson: Lesson = {
  id: 'lld-template-method',
  title: 'Template Method Pattern',
  description: 'Define an algorithm\'s skeleton in a base class, deferring some steps to subclasses.',
  difficulty: 'Beginner',
  estimatedMinutes: 10,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Template Method** pattern defines the skeleton of an algorithm in a base class method, deferring some steps to subclasses. Subclasses can redefine certain steps without changing the algorithm\'s structure.\n\nThe invariant parts of the algorithm live in the base class. The variable parts (hooks) are abstract methods that subclasses implement.\n\nReal examples: `java.io.InputStream.read()`, JUnit\'s `setUp()/tearDown()`, Spring\'s `JdbcTemplate`, data mining algorithms with variable parsing steps.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'Two classes do the same algorithm — open file, parse data, process records, generate report, close file — but differ only in parsing. Without Template Method, you either duplicate the algorithm or create a complex conditional.\n\nTemplate Method extracts the common skeleton into the base class. Only the parsing step is abstract. Subclasses provide their parsing logic; the algorithm flow is fixed.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'Building a house: the sequence is always the same — foundation, walls, roof, interior. The construction company (base class) defines this fixed sequence. What changes is the style: Tudor walls vs. Modern walls, tile roof vs. metal roof.\n\nThe template is the sequence. The subclass fills in the style-specific steps.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Abstract base class** — defines the template method (the fixed algorithm skeleton); calls abstract steps.\n\n**Abstract steps** — methods declared abstract in the base class that subclasses must implement.\n\n**Hooks** — optional methods with default (empty) implementations that subclasses may override.\n\n**Final template method** — often declared `final` to prevent subclasses from changing the algorithm order.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Data export pipeline with variable format steps:',
      codeExamples: {
        java:
`import java.util.*;

// Abstract base class — defines the algorithm template
public abstract class DataExporter {

    // Template method — final to prevent reordering
    public final void export(List<Map<String, Object>> data, String filename) {
        System.out.println("=== Export: " + filename + " ===");
        validateData(data);           // concrete step — same for all
        List<String> formatted = format(data);  // abstract — differs per subclass
        String output = buildOutput(formatted);  // concrete step
        write(output, filename);      // concrete step
        afterExport(filename);        // hook — optional override
    }

    // Concrete step — invariant
    private void validateData(List<Map<String, Object>> data) {
        if (data == null || data.isEmpty()) throw new IllegalArgumentException("Empty data");
        System.out.println("Validated " + data.size() + " records");
    }

    // Abstract step — subclasses MUST implement
    protected abstract List<String> format(List<Map<String, Object>> data);

    // Concrete step — invariant
    private String buildOutput(List<String> lines) { return String.join("\n", lines); }

    // Concrete step — writes to "file" (stdout here)
    private void write(String content, String filename) {
        System.out.println("Writing to " + filename + ":\n" + content);
    }

    // Hook — subclasses MAY override
    protected void afterExport(String filename) {
        System.out.println("Export complete: " + filename);
    }
}

// Concrete subclass — CSV format
public class CsvExporter extends DataExporter {
    @Override
    protected List<String> format(List<Map<String, Object>> data) {
        List<String> rows = new ArrayList<>();
        if (!data.isEmpty()) {
            rows.add(String.join(",", data.get(0).keySet()));  // header
        }
        for (Map<String, Object> row : data) {
            rows.add(String.join(",", row.values().stream()
                .map(Object::toString).toList()));
        }
        return rows;
    }
}

// Concrete subclass — JSON format
public class JsonExporter extends DataExporter {
    @Override
    protected List<String> format(List<Map<String, Object>> data) {
        List<String> rows = new ArrayList<>();
        rows.add("[");
        for (int i = 0; i < data.size(); i++) {
            Map<String, Object> row = data.get(i);
            StringBuilder sb = new StringBuilder("  {");
            row.forEach((k, v) -> sb.append('"').append(k).append("\":\"").append(v).append("\","));
            sb.deleteCharAt(sb.length() - 1);
            sb.append(i < data.size() - 1 ? "}," : "}");
            rows.add(sb.toString());
        }
        rows.add("]");
        return rows;
    }
    @Override
    protected void afterExport(String filename) {
        super.afterExport(filename);
        System.out.println("JSON schema validated");  // override hook
    }
}

// Usage
List<Map<String, Object>> data = List.of(
    Map.of("id", 1, "name", "Alice"),
    Map.of("id", 2, "name", "Bob")
);
new CsvExporter().export(data, "users.csv");
new JsonExporter().export(data, "users.json");`,
        cpp:
`#include <iostream>
#include <vector>
#include <map>
#include <string>
#include <sstream>

using Row = std::map<std::string, std::string>;

class DataExporter {
public:
    // Template method — final (non-virtual)
    void exportData(const std::vector<Row>& data, const std::string& filename) {
        validate(data);
        auto formatted = format(data);   // virtual step
        write(formatted, filename);
        afterExport(filename);           // hook
    }
protected:
    virtual std::vector<std::string> format(const std::vector<Row>& data) = 0;
    virtual void afterExport(const std::string& fn) {
        std::cout << "Export done: " << fn << "\n";
    }
private:
    void validate(const std::vector<Row>& data) {
        std::cout << "Validated " << data.size() << " records\n";
    }
    void write(const std::vector<std::string>& lines, const std::string& fn) {
        std::cout << "Writing " << fn << ":\n";
        for (const auto& l : lines) std::cout << l << "\n";
    }
public:
    virtual ~DataExporter() = default;
};

class CsvExporter : public DataExporter {
protected:
    std::vector<std::string> format(const std::vector<Row>& data) override {
        std::vector<std::string> rows;
        if (!data.empty()) {
            std::string header;
            for (const auto& [k, _] : data[0]) header += k + ",";
            rows.push_back(header);
            for (const auto& row : data) {
                std::string line;
                for (const auto& [_, v] : row) line += v + ",";
                rows.push_back(line);
            }
        }
        return rows;
    }
};

int main() {
    std::vector<Row> data = {{"id","1","name","Alice"}, {"id","2","name","Bob"}};
    CsvExporter().exportData(data, "users.csv");
}`,
        python:
`from abc import ABC, abstractmethod

class DataExporter(ABC):
    """Template Method: defines the export algorithm skeleton."""

    def export(self, data: list[dict], filename: str) -> None:
        """Template method — do not override."""
        print(f"=== Export: {filename} ===")
        self._validate(data)
        formatted = self._format(data)      # abstract — subclass fills in
        output = "\n".join(formatted)
        self._write(output, filename)
        self._after_export(filename)        # hook — optional override

    # Invariant steps
    def _validate(self, data: list[dict]) -> None:
        if not data:
            raise ValueError("Empty data")
        print(f"Validated {len(data)} records")

    def _write(self, content: str, filename: str) -> None:
        print(f"Writing {filename}:\n{content}")

    # Abstract step — subclasses must implement
    @abstractmethod
    def _format(self, data: list[dict]) -> list[str]: ...

    # Hook — optional override
    def _after_export(self, filename: str) -> None:
        print(f"Export complete: {filename}")

class CsvExporter(DataExporter):
    def _format(self, data: list[dict]) -> list[str]:
        if not data:
            return []
        header = ",".join(data[0].keys())
        rows = [",".join(str(v) for v in row.values()) for row in data]
        return [header] + rows

class JsonExporter(DataExporter):
    def _format(self, data: list[dict]) -> list[str]:
        import json
        return [json.dumps(data, indent=2)]

    def _after_export(self, filename: str) -> None:
        super()._after_export(filename)
        print("JSON schema validated")

data = [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]
CsvExporter().export(data, "users.csv")
JsonExporter().export(data, "users.json")`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**Code reuse** — the invariant algorithm steps live once in the base class.\n\n**Inversion of control** — the base class calls the subclass (Hollywood Principle: "don\'t call us, we\'ll call you").\n\n**Easy extension** — add a new algorithm variant by adding a new subclass.\n\n**Consistency** — the algorithm skeleton is always the same; only the pluggable steps vary.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Inheritance limitation** — Java/Python single inheritance limits how many algorithms a class can combine.\n\n**Subtle flow** — the algorithm flow is in the base class but the behavior is in the subclass; debugging requires looking at both.\n\n**Hooks may be ignored** — if a hook\'s override is critical, it\'s easy to forget to implement it.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is the Hollywood Principle and how does Template Method implement it?\n2. What is the difference between Template Method and Strategy?\n3. When would you choose Strategy over Template Method?\n4. How does JUnit\'s test lifecycle use Template Method?\n5. What is a "hook method" and how does it differ from an abstract method?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Not making the template method final** — if subclasses can override the template method, they can break the algorithm invariant.\n\n**Too many abstract steps** — if everything is abstract, the template has no invariant; use Strategy instead.\n\n**Confusing hooks and required steps** — a hook has a default implementation (may be overridden); an abstract step must be overridden.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Make the template method `final`** — prevent subclasses from reordering algorithm steps.\n\n**Minimize abstract steps** — the fewer hooks, the more predictable the behavior.\n\n**Prefer Strategy when the algorithm should vary at runtime** — Template Method requires subclassing; Strategy uses composition.' },
    { id: 'summary', title: 'Summary', content: '**Template Method in one line**: define the algorithm once in the base class; let subclasses fill in the variable steps.\n\n**When to use**: several classes implement the same algorithm but differ in specific steps.\n\n**vs. Strategy**: Template Method uses inheritance; Strategy uses composition. Strategy is more flexible at runtime.\n\n**Real examples**: JUnit setUp/tearDown, Spring JdbcTemplate, InputStream.read().' },
  ],
};

export const visitorLesson: Lesson = {
  id: 'lld-visitor',
  title: 'Visitor Pattern',
  description: 'Add new operations to an object structure without modifying the elements.',
  difficulty: 'Advanced',
  estimatedMinutes: 14,
  steps: [
    { id: 'introduction', title: 'Introduction', content: 'The **Visitor** pattern lets you add new operations to an object structure without modifying the elements. You separate the algorithm from the objects it operates on.\n\nA Visitor object is passed to each element in the structure; the element calls `visitor.visit(this)` — a technique called **double dispatch**.\n\nReal examples: compilers (AST traversal for type checking, code generation), document exporters, tax calculation systems, and shopping cart discount engines.' },
    { id: 'problem', title: 'The Problem It Solves', content: 'You have a document AST with elements: Paragraph, Heading, Image, Table. You need: export to HTML, export to PDF, calculate word count, and run spell check — all without modifying Paragraph, Heading, etc.\n\nWithout Visitor, you either add all these methods to each element (violating SRP, OCP) or use instanceof chains in external code.\n\nVisitor adds each operation as a Visitor class. Adding spell check = adding SpellCheckVisitor. No changes to any element.' },
    { id: 'analogy', title: 'Real Life Analogy', content: 'A government inspector (Visitor) visits different types of buildings (Elements): residential, commercial, industrial. At each building, the inspector performs inspections specific to that building type.\n\nThe building doesn\'t change — it just accepts the inspector. The inspector knows what to check at each type. Adding a new inspection type (fire safety inspector) = a new Visitor, not changes to every building.' },
    { id: 'how-it-works', title: 'How It Works', content: '**Visitor interface** — declares `visit(ConcreteElement)` overloads for every Element type.\n\n**ConcreteVisitor** — implements all visit methods; each method is one operation for one element type.\n\n**Element interface** — declares `accept(Visitor)` method.\n\n**ConcreteElement** — implements `accept(v) { v.visit(this); }` — this enables double dispatch.\n\n**Double dispatch**: the right `visit()` overload is chosen based on both the Visitor type AND the Element type.' },
    {
      id: 'implementation', title: 'Implementation', content: 'Document AST with HTML and word-count visitors:',
      codeExamples: {
        java:
`import java.util.*;

// Element interface
public interface DocumentElement {
    void accept(DocumentVisitor visitor);
}

// Visitor interface
public interface DocumentVisitor {
    void visit(Paragraph paragraph);
    void visit(Heading heading);
    void visit(Image image);
}

// Concrete elements
public class Paragraph implements DocumentElement {
    private final String text;
    public Paragraph(String text) { this.text = text; }
    public String getText() { return text; }
    public void accept(DocumentVisitor visitor) { visitor.visit(this); }
}
public class Heading implements DocumentElement {
    private final String text;
    private final int level;
    public Heading(String text, int level) { this.text = text; this.level = level; }
    public String getText() { return text; }
    public int getLevel() { return level; }
    public void accept(DocumentVisitor visitor) { visitor.visit(this); }
}
public class Image implements DocumentElement {
    private final String src, alt;
    public Image(String src, String alt) { this.src = src; this.alt = alt; }
    public String getSrc() { return src; }
    public String getAlt() { return alt; }
    public void accept(DocumentVisitor visitor) { visitor.visit(this); }
}

// Concrete Visitor 1 — HTML export
public class HtmlExportVisitor implements DocumentVisitor {
    private final StringBuilder output = new StringBuilder();

    public void visit(Paragraph p) {
        output.append("<p>").append(p.getText()).append("</p>\n");
    }
    public void visit(Heading h) {
        output.append("<h").append(h.getLevel()).append(">")
              .append(h.getText())
              .append("</h").append(h.getLevel()).append(">\n");
    }
    public void visit(Image img) {
        output.append("<img src=\"").append(img.getSrc())
              .append("\" alt=\"").append(img.getAlt()).append("\">\n");
    }
    public String getHtml() { return output.toString(); }
}

// Concrete Visitor 2 — word count
public class WordCountVisitor implements DocumentVisitor {
    private int wordCount = 0;

    public void visit(Paragraph p)  { wordCount += p.getText().split("\\s+").length; }
    public void visit(Heading h)    { wordCount += h.getText().split("\\s+").length; }
    public void visit(Image img)    { wordCount += img.getAlt().split("\\s+").length; }
    public int getWordCount()       { return wordCount; }
}

// Usage — elements unchanged; operations added as Visitors
List<DocumentElement> doc = List.of(
    new Heading("Introduction", 1),
    new Paragraph("The visitor pattern adds operations without changing elements."),
    new Image("diagram.png", "Visitor UML diagram")
);

HtmlExportVisitor html = new HtmlExportVisitor();
WordCountVisitor words = new WordCountVisitor();

for (DocumentElement el : doc) {
    el.accept(html);
    el.accept(words);
}
System.out.println(html.getHtml());
System.out.println("Words: " + words.getWordCount());`,
        cpp:
`#include <iostream>
#include <vector>
#include <string>
#include <memory>
#include <sstream>

// Forward declarations
class Paragraph; class Heading; class Image;

// Visitor interface
class DocumentVisitor {
public:
    virtual void visit(Paragraph& p) = 0;
    virtual void visit(Heading& h) = 0;
    virtual void visit(Image& img) = 0;
    virtual ~DocumentVisitor() = default;
};

// Element base
class DocumentElement {
public:
    virtual void accept(DocumentVisitor& v) = 0;
    virtual ~DocumentElement() = default;
};

class Paragraph : public DocumentElement {
public:
    std::string text;
    explicit Paragraph(std::string t) : text(std::move(t)) {}
    void accept(DocumentVisitor& v) override { v.visit(*this); }
};
class Heading : public DocumentElement {
public:
    std::string text; int level;
    Heading(std::string t, int l) : text(std::move(t)), level(l) {}
    void accept(DocumentVisitor& v) override { v.visit(*this); }
};
class Image : public DocumentElement {
public:
    std::string src, alt;
    Image(std::string s, std::string a) : src(std::move(s)), alt(std::move(a)) {}
    void accept(DocumentVisitor& v) override { v.visit(*this); }
};

// HTML Visitor
class HtmlExportVisitor : public DocumentVisitor {
    std::ostringstream out_;
public:
    void visit(Paragraph& p) override { out_ << "<p>" << p.text << "</p>\n"; }
    void visit(Heading& h)   override { out_ << "<h" << h.level << ">" << h.text << "</h" << h.level << ">\n"; }
    void visit(Image& img)   override { out_ << "<img src='" << img.src << "' alt='" << img.alt << "'>\n"; }
    std::string html() const { return out_.str(); }
};

int main() {
    std::vector<std::unique_ptr<DocumentElement>> doc;
    doc.push_back(std::make_unique<Heading>("Introduction", 1));
    doc.push_back(std::make_unique<Paragraph>("Visitor adds operations."));
    doc.push_back(std::make_unique<Image>("diagram.png", "UML"));

    HtmlExportVisitor html;
    for (auto& el : doc) el->accept(html);
    std::cout << html.html();
}`,
        python:
`from __future__ import annotations
from abc import ABC, abstractmethod

# Visitor interface
class DocumentVisitor(ABC):
    @abstractmethod
    def visit_paragraph(self, element: "Paragraph") -> None: ...
    @abstractmethod
    def visit_heading(self, element: "Heading") -> None: ...
    @abstractmethod
    def visit_image(self, element: "Image") -> None: ...

# Element base
class DocumentElement(ABC):
    @abstractmethod
    def accept(self, visitor: DocumentVisitor) -> None: ...

# Concrete elements
class Paragraph(DocumentElement):
    def __init__(self, text: str) -> None: self.text = text
    def accept(self, v: DocumentVisitor) -> None: v.visit_paragraph(self)

class Heading(DocumentElement):
    def __init__(self, text: str, level: int) -> None:
        self.text = text; self.level = level
    def accept(self, v: DocumentVisitor) -> None: v.visit_heading(self)

class Image(DocumentElement):
    def __init__(self, src: str, alt: str) -> None:
        self.src = src; self.alt = alt
    def accept(self, v: DocumentVisitor) -> None: v.visit_image(self)

# Concrete Visitors
class HtmlExportVisitor(DocumentVisitor):
    def __init__(self) -> None: self._output: list[str] = []
    def visit_paragraph(self, el: Paragraph) -> None:
        self._output.append(f"<p>{el.text}</p>")
    def visit_heading(self, el: Heading) -> None:
        self._output.append(f"<h{el.level}>{el.text}</h{el.level}>")
    def visit_image(self, el: Image) -> None:
        self._output.append(f'<img src="{el.src}" alt="{el.alt}">')
    def get_html(self) -> str: return "\n".join(self._output)

class WordCountVisitor(DocumentVisitor):
    def __init__(self) -> None: self.count = 0
    def visit_paragraph(self, el: Paragraph) -> None:
        self.count += len(el.text.split())
    def visit_heading(self, el: Heading) -> None:
        self.count += len(el.text.split())
    def visit_image(self, el: Image) -> None:
        self.count += len(el.alt.split())

# Usage
doc: list[DocumentElement] = [
    Heading("Introduction", 1),
    Paragraph("The visitor pattern adds operations without changing elements."),
    Image("diagram.png", "Visitor UML diagram"),
]

html_visitor = HtmlExportVisitor()
word_visitor = WordCountVisitor()

for element in doc:
    element.accept(html_visitor)
    element.accept(word_visitor)

print(html_visitor.get_html())
print(f"Word count: {word_visitor.count}")`,
      },
    },
    { id: 'advantages', title: 'Advantages', content: '**OCP** — add new operations without modifying element classes.\n\n**SRP** — each Visitor is responsible for one operation across all element types.\n\n**Accumulate state** — a Visitor can gather data across all elements (word count, total price, etc.).\n\n**Double dispatch** — the right visit() overload is chosen based on both the Visitor AND Element type.' },
    { id: 'disadvantages', title: 'Disadvantages', content: '**Hard to add new elements** — adding a new DocumentElement requires changing all existing Visitors.\n\n**Breaks encapsulation** — Visitors often need access to element internals, forcing elements to expose data.\n\n**Complexity** — double dispatch is non-obvious and confuses developers unfamiliar with the pattern.' },
    { id: 'interview-questions', title: 'Interview Questions', content: '1. What is "double dispatch" and why does Visitor need it?\n2. When would you choose Visitor over adding methods to each element?\n3. What is the difference between Visitor and Iterator?\n4. Design a shopping cart discount system using Visitor.\n5. How do compilers use Visitor for AST traversal?' },
    { id: 'common-mistakes', title: 'Common Mistakes', content: '**Forgetting to update all Visitors when adding an element** — every existing Visitor must handle the new element type.\n\n**Using Visitor when elements change often** — if you frequently add new element types, Visitor is the wrong pattern (prefer adding methods to elements).\n\n**Not using double dispatch** — calling `visitor.visitSpecificType(element)` inside accept() is required; generic `visit(element)` loses type information.' },
    { id: 'best-practices', title: 'Best Practices', content: '**Use Visitor when operations change often, elements change rarely** — opposite: use methods on elements when elements change often.\n\n**Provide a default Visitor base** — an abstract base Visitor with no-op implementations lets concrete Visitors handle only the elements they care about.\n\n**Consider a functional alternative** — in languages with pattern matching (Kotlin, Scala, C++17 std::visit), a `when`/`match` expression may be cleaner.' },
    { id: 'summary', title: 'Summary', content: '**Visitor in one line**: add operations to objects without modifying them — the operation travels to the object.\n\n**When to use**: stable element hierarchy + many operations that may grow over time (ASTs, document models).\n\n**Double dispatch**: `element.accept(visitor)` → `visitor.visit(this)` — two virtual dispatch calls determine the right behavior.\n\n**Real examples**: compiler AST passes, document exporters, tax/discount engines, shopping cart.' },
  ],
};
