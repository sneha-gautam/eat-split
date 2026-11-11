"""
EAT & SPLIT (Tip & Split Calculator)
Mode 1: Equal split         (calculate_tip + split_bill)
Mode 2: Split by order      (each person's order, shared items, tax, discount, tip)
"""


# ---------- Helper: safe number input ----------
def get_number(prompt, kind=float, minimum=0):
    while True:
        try:
            value = kind(input(prompt))
        except ValueError:
            print("Bro, that is not a number. Try again.")
            continue
        if value < minimum:
            print(f"Needs to be at least {minimum}, bestie.")
        else:
            return value


# ---------- Functions required by the task ----------
def calculate_tip(bill, tip_percent):
    """Returns the tip amount for a bill."""
    return bill * tip_percent / 100


def split_bill(total, people):
    """Splits a total evenly between people. Returns each person's share."""
    return total / people


# ---------- Unequal split (level up) ----------
def split_by_order(orders, tax, tip=0, discount=0):
    """Shares tax, tip and discount in the ratio of each person's order."""
    subtotal = sum(orders.values())
    shares = {}
    for name, amount in orders.items():
        ratio = amount / subtotal
        shares[name] = amount + (tax + tip - discount) * ratio
    return shares


def fix_rounding(shares, grand_total):
    """Rounds to 2 decimals and puts any leftover paisa on the biggest share,
    so the shares add up exactly to the bill."""
    rounded = {name: round(s, 2) for name, s in shares.items()}
    diff = round(grand_total - sum(rounded.values()), 2)
    if diff != 0:
        biggest = max(rounded, key=rounded.get)
        rounded[biggest] = round(rounded[biggest] + diff, 2)
    return rounded


# ---------- Mode 1: equal split ----------
def equal_mode():
    bill = get_number("Total damage (bill amount): ", minimum=0.01)
    tax = get_number("Tax on the bill (0 if it is already baked in): ")
    tip_percent = get_number("Tip % (0 if none, no judgment): ")
    people = get_number("How many besties are eating? ", kind=int, minimum=1)

    tip = calculate_tip(bill, tip_percent)
    total = bill + tax + tip
    share = split_bill(total, people)

    print("\n" + "=" * 40)
    print(f"Bill     : {bill:.2f}")
    print(f"Tax      : {tax:.2f}")
    print(f"Tip ({tip_percent:g}%): {tip:.2f}")
    print(f"DAMAGE   : {total:.2f}")
    print("=" * 40)
    print(f"Each of the {people} besties pays: {share:.2f}")


# ---------- Mode 2: split by what each person ordered ----------
def order_mode():
    count = get_number("How many besties are eating? ", kind=int, minimum=1)

    orders = {}
    for i in range(1, count + 1):
        name = input(f"Bestie #{i} name: ").strip() or f"Bestie {i}"
        while name in orders:
            name = input("  That name is taken, pick another: ").strip() or f"Bestie {i}"
        orders[name] = get_number(f"  {name}'s plate (amount before tax): ", minimum=0.01)

    # Items everyone shared (sides, drinks...) are split equally first
    shared = get_number("\nGroup stuff everyone shared (fries, drinks, 0 if none): ")
    if shared > 0:
        for name in orders:
            orders[name] += shared / count

    subtotal = sum(orders.values())

    # Some bills don't show tax separately, only the final total.
    # In that case the program finds the tax itself: total - sum of orders.
    shown = input("\nDoes the bill show tax separately? (y/n): ").strip().lower()
    if shown == "y":
        tax = get_number("Total tax on the bill: ")
        discount = get_number("Total discount, the W (0 if none): ")
    else:
        bill_total = get_number("Final total on the bill (tax already in there): ", minimum=0.01)
        tax = round(bill_total - subtotal, 2)
        discount = 0
        rate = tax / subtotal * 100
        if tax < 0:
            print(f"  Plot twist: bill total is {abs(tax):.2f} LESS than the food (discount?). "
                  "We are sharing the W fairly.")
        else:
            print(f"  Caught the tax/charges: {tax:.2f} (about {rate:.1f}% of the food), no cap")

    tip_percent = get_number("Tip % (0 if none, no judgment): ")
    tip = calculate_tip(subtotal, tip_percent)
    grand_total = round(subtotal + tax + tip - discount, 2)

    shares = split_by_order(orders, tax, tip, discount)
    shares = fix_rounding(shares, grand_total)

    print("\n" + "=" * 52)
    print(f"Food     : {subtotal:.2f}")
    print(f"Tax      : {tax:.2f}")
    print(f"Tip ({tip_percent:g}%): {tip:.2f}")
    print(f"Discount : -{discount:.2f}")
    print(f"DAMAGE   : {grand_total:.2f}")
    print("=" * 52)
    print(f"{'Name':<15}{'Order':>10}{'Tax':>9}{'Tip':>9}{'Owes':>9}")
    for name, share in shares.items():
        ratio = orders[name] / subtotal
        print(f"{name:<15}{orders[name]:>10.2f}{tax * ratio:>9.2f}{tip * ratio:>9.2f}{share:>9.2f}")
    print("-" * 52)
    print(f"{'Squad total':<15}{'':>28}{sum(shares.values()):>9.2f}")


# ---------- Main ----------
print("🍽️  Eat & Split: no more maths debates at dinner\n")

while True:
    print("\n1. Split it even, no drama")
    print("2. Pay for your own plate (tax, tip, discount shared fairly)")
    print("3. Dip")
    choice = input("Pick your move (1-3): ").strip()

    if choice == "1":
        equal_mode()
    elif choice == "2":
        order_mode()
    elif choice == "3":
        print("Dip secured. Hope the food was bussin! 👋")
        break
    else:
        print("Bestie, it is 1, 2 or 3.")