#!/usr/bin/perl
use LWP::Simple;
use FindBin qw($Bin);
use lib "$Bin/JSON-2.53/lib/";
use JSON;
use strict;
use warnings;

my $url = "http://users.wpi.edu/~fcarnevale/hmn/js/objects.json";

my $json = get( $url );
die "Could not get \"$url\"\n" unless defined $json;

my $hash_ref = decode_json($json);
my %json_hash = %$hash_ref;

my %failed = ();


foreach my $key(keys %json_hash){
	print "Testing: ",$key,"\t\t";
	my $obj = get( $json_hash{$key}{'link'} );
	if(!defined $obj){
		print "Failure\n";
		$failed{$key} = $json_hash{$key}{'link'};
	}else{
		print "Success\n";
	}
}


my $message = "The following links failed\n";

foreach my $key(keys %failed){
	$message .= "Object: ".$key."\n"."Link: ".$failed{$key}."\n\n";
}

print $message;

sendEmail("fjcarnevale\@gmail.com","hmn\@cs.wpi.edu","HMN Link Failures",$message);

sub sendEmail{

	my($to, $from, $subject, $message) = @_;
	my $sendmail = '/usr/lib/sendmail';
	open(MAIL, "|$sendmail -oi -t");
	print MAIL "From: $from\n";
	print MAIL "To: $to\n";
	print MAIL "Subject: $subject\n\n";
	print MAIL "$message\n";
	close(MAIL);
}












