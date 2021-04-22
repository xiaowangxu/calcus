export class C {
	constructor(c) {
		this.c = c;
	}

	calcu() {
		return this.c;
	}

	deriv() {
		return new C(0);
	}

	tex() {
		return this.c.toString();
	}
}

export class Sym {
	constructor(name) {
		this.name = name;
	}

	calcu(x) {
		return x[this.name];
	}

	deriv(name) {
		if (this.name === name) return new C(1);
		return new C(0);
	}

	tex() {
		return this.name;
	}
}

export class Neg {
	constructor(f) {
		return new Mul(new C(-1), f)
	}
}

export class Sin {
	constructor(f) {
		this.f = f;
	}

	calcu(x) {
		return Math.sin(this.f.calcu(x));
	}

	deriv(name) {
		return new Mul(
			this.f.deriv(name),
			new Cos(this.f)
		)
	}
	tex() {
		return `sin( ${this.f.tex()} )`;
	}
}

export class Cos {
	constructor(f) {
		this.f = f;
	}

	calcu(x) {
		return Math.cos(this.f.calcu(x));
	}

	deriv(name) {
		return new Mul(
			this.f.deriv(name),
			new Neg(
				new Sin(this.f)
			)
		)
	}

	tex() {
		return `cos( ${this.f.tex()} )`;
	}
}

export class Add {
	constructor(f1, f2) {
		if (f1 instanceof C && f2 instanceof C) {
			return new C(f1.calcu() + f2.calcu())
		}
		if (f1 instanceof C && f1.calcu() === 0) {
			return f2
		}
		if (f2 instanceof C && f2.calcu() === 0) {
			return f1
		}
		this.f1 = f1;
		this.f2 = f2;
	}

	calcu(x) {
		return this.f1.calcu(x) + this.f2.calcu(x);
	}

	deriv(name) {
		return new Add(
			this.f1.deriv(name),
			this.f2.deriv(name)
		)
	}
}

export class Sub {
	constructor(f1, f2) {
		if (f1 instanceof C && f2 instanceof C) {
			return new C(f1.calcu() - f2.calcu())
		}
		if (f1 instanceof C && f1.calcu() === 0) {
			return new Neg(f2);
		}
		if (f2 instanceof C && f2.calcu() === 0) {
			return f1;
		}
		this.f1 = f1;
		this.f2 = f2;
	}

	calcu(x) {
		return this.f1.calcu(x) - this.f2.calcu(x);
	}

	deriv(name) {
		return new Sub(
			this.f1.deriv(name),
			this.f2.deriv(name)
		)
	}
}

export class Mul {
	constructor(f1, f2) {
		if (f1 instanceof C && f2 instanceof C) {
			return new C(f1.calcu() * f2.calcu())
		}
		if (f1 instanceof C && f1.calcu() === 0) {
			return new C(0)
		}
		if (f2 instanceof C && f2.calcu() === 0) {
			return new C(0)
		}
		if (f1 instanceof C && f1.calcu() === 1) {
			return f2
		}
		if (f2 instanceof C && f2.calcu() === 1) {
			return f1
		}
		if (f1 instanceof C && f2 instanceof Mul && f2.f1 instanceof C) {
			return new Mul(new C(f1.calcu() * f2.f1.calcu()), f2.f2)
		}
		if (f1 instanceof C && f2 instanceof Mul && f2.f2 instanceof C) {
			return new Mul(new C(f1.calcu() * f2.f2.calcu()), f2.f1)
		}
		if (f2 instanceof C && f2 instanceof Mul && f1.f1 instanceof C) {
			return new Mul(new C(f2.calcu() * f1.f1.calcu()), f1.f2)
		}
		if (f2 instanceof C && f2 instanceof Mul && f1.f2 instanceof C) {
			return new Mul(new C(f2.calcu() * f1.f2.calcu()), f1.f1)
		}
		this.f1 = f1;
		this.f2 = f2;
	}

	calcu(x) {
		return this.f1.calcu(x) * this.f2.calcu(x);
	}

	deriv(name) {
		return new Add(
			new Mul(
				this.f1.deriv(name),
				this.f2
			),
			new Mul(
				this.f1,
				this.f2.deriv(name)
			)
		)
	}

	tex() {
		return `${this.f1.tex()} ${this.f2.tex()}`;
	}
}

export class Div {
	constructor(f1, f2) {
		if (f1 instanceof C && f2 instanceof C) {
			return new C(f1.calcu() / f2.calcu())
		}
		this.f1 = f1;
		this.f2 = f2;
	}

	calcu(x) {
		return this.f1.calcu(x) / this.f2.calcu(x);
	}

	deriv(name) {
		return new Div(
			new Sub(
				new Mul(
					this.f1.deriv(name),
					this.f2
				),
				new Mul(
					this.f1,
					this.f2.deriv(name)
				)
			),
			new Pow(
				this.f2,
				new C(2)
			)
		)
	}
}

export class Ln {
	constructor(f) {
		if (f instanceof C) {
			return new C(Math.log(f.calcu()))
		}
		this.f = f;
	}

	calcu(x) {
		return Math.log(this.f.calcu(x));
	}

	deriv(name) {
		return new Div(
			new C(1),
			this.f
		)
	}
}

export class Pow {
	constructor(f1, f2) {
		if (f1 instanceof C && f2 instanceof C) {
			return new C(f1.calcu() ** f2.calcu())
		}
		this.f1 = f1;
		this.f2 = f2;
	}

	calcu(x) {
		return this.f1.calcu(x) ** this.f2.calcu(x);
	}

	deriv(name) {
		return new Mul(
			new Pow(
				this.f1,
				this.f2
			),
			new Add(
				new Mul(
					new Div(
						this.f2,
						this.f1
					),
					this.f1.deriv(name)
				),
				new Mul(
					this.f2.deriv(name),
					new Ln(this.f1)
				),
			)
		)
	}
}